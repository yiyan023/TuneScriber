import requests
import os
from dotenv import load_dotenv
from musicai_sdk import MusicAiClient
import time
import mido
import librosa
import pretty_midi
import json
import csv
import numpy as np
import shutil

from basic_pitch.inference import *
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.constants import AUDIO_SAMPLE_RATE, FFT_HOP
from music21 import converter, instrument, note, chord, stream, environment

import whisper

from pathlib import Path

load_dotenv()

MUSICAI_KEY = os.getenv("MUSICAI_KEY")
STEM_SEPARATION_WORKFLOW_ID = os.getenv("STEM_SEPARATION_WORKFLOW_ID")

STEM_SEPARATION_ENDPOINT = f"https://api.music.ai/api/job"
UPLOAD_URL_ENDPOINT = "https://api.music.ai/api/upload"

# default to cpu (ignore cpu for now)
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

class MusicProcessor:
    def __init__(self, api_key=MUSICAI_KEY, stem_separation_workflow_id=STEM_SEPARATION_WORKFLOW_ID):
        self.api_key = api_key
        self.stem_separation_workflow_id = stem_separation_workflow_id
        self.client = MusicAiClient(api_key=api_key)
        self.uploaded_file = None
        self.processed_files = []

    def upload(self, file):
        response = self.client.upload_file(file)
        return response

    def create_job(self, job_name, workflow_id, params):
        job = self.client.create_job(job_name, workflow_id, params)
        return job

    def wait_for_job(self, job_id):
        job = self.client.wait_for_job_completion(job_id)
        return job

    def get_job_info(self, job_id):
        job = self.client.get_job(job_id)
        return job

    def separate(self, file):
        file_url = self.upload(file)
        job = self.create_job(
            "test-job", self.stem_separation_workflow_id, {
                "inputUrl": file_url}
        )
        job_id = job["id"]
        job_info = self.wait_for_job(job_id)

        return job_info["status"], job_info["result"]

    def download(self, url, output_dir, filename):
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            file_path = os.path.join(output_dir, filename)
            with open(file_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)

    #### wav folder -> midi folder (.mid files) and pdf folder (.pdf and .musicxml files) ####

    def change_instrument_mido(self, midi_file_path, new_instrument, output_file_path):
        mid = mido.MidiFile(midi_file_path)

        for track in mid.tracks:
            for i, msg in enumerate(track):
                if msg.type == 'program_change':
                    track[i] = mido.Message('program_change', program=new_instrument)

        mid.save(output_file_path)

    # usage of last two variables (new_instrument and is_drum) are mutually exclusive: if one is used the other will not be in the code
    def wav_to_midi(self, input_name, input_dir, output_dir, new_instrument, is_drum=False):
        output_name_model = input_name.replace(".wav", ".npz")
        output_name_midi = input_name.replace(".wav", ".mid")
        output_name_csv = input_name.replace(".wav", ".csv")

        input_path = os.path.join(input_dir, input_name)
        os.makedirs(output_dir, exist_ok=True)

        if not is_drum:
            model_output, midi_data, note_events = predict(input_path)

            temp_midi_path = os.path.join(output_dir, 'temp_' + output_name_midi)
            with open(temp_midi_path, 'wb') as f:
                midi_data.write(f)

            output_path = os.path.join(output_dir, output_name_midi)
            self.change_instrument_mido(temp_midi_path, new_instrument, output_path)

            # REMOVE TEMP FILE
            os.remove(temp_midi_path)

    def midi_to_pdf(self, input_name, input_dir, output_dir, musescore_path):
        output_name_pdf = input_name.replace(".midi", ".pdf").replace(".mid", ".pdf")
        output_name_musicxml = input_name.replace(".midi", ".musicxml").replace(".mid", ".musicxml")

        midi_path = os.path.join(input_dir, input_name)
        output_path_musicxml = os.path.join(output_dir, output_name_musicxml)
        output_path_pdf = os.path.join(output_dir, output_name_pdf)

        os.makedirs(output_dir, exist_ok=True)

        # Set path to MuseScore
        us = environment.UserSettings()
        us['musicxmlPath'] = musescore_path

        # Debu print
        print(f"Checking for midi file at: {midi_path}")
        if not os.path.exists(midi_path):
            raise FileNotFoundError(f"The file {midi_path} does not exist.")

        midi_data = converter.parse(midi_path)
        parts = instrument.partitionByInstrument(midi_data)
        score = stream.Score()

        # If multiple parts => add each part to  score
        if parts:  # if parts is not None
            for part in parts.parts:
                score.append(part)
        else:  # if no parts, just add the midi_data itself
            score.append(midi_data)

        score.write('musicxml', fp=output_path_musicxml)

        os.system(f"mscore3 {output_path_musicxml} -o {output_path_pdf}")

        print(f"MusicXML file saved to: {output_path_musicxml}")
        print(f"PDF file saved to: {output_path_pdf}")

    # usage of last two variables (new_instrument and is_drum) are mutually exclusive: if one is used the other will not be in the code
    def single_wav_conversion(self, input_name_no_filetype, wav_dir, midi_dir, pdf_dir, new_instrument, is_drum=False):
        input_name_wav = input_name_no_filetype + '.wav'
        input_name_midi = input_name_no_filetype + '.mid'
        self.wav_to_midi(input_name_wav, wav_dir, midi_dir, new_instrument, is_drum)
        self.midi_to_pdf(input_name_midi, midi_dir, pdf_dir, '/usr/bin/mscore3')

    def batch_wav_conversion(self, wav_dir, midi_dir, pdf_dir):
        for file in os.listdir(wav_dir):
            input_name_no_filetype = file.split('.')[0]
            input_name_wav = file
            input_name_midi = file.replace('.wav', '.mid')

            instrument_number = -1
            is_drum = False
            if input_name_no_filetype == 'bass':
                instrument_number = 33
            elif input_name_no_filetype == 'drums':
                instrument_number = 0  # Program change number is not used for drums, so it's set to 0
                is_drum = True
                continue
            elif input_name_no_filetype == 'guitar':
                instrument_number = 24
            elif input_name_no_filetype == 'keys':
                instrument_number = 0
            elif input_name_no_filetype == 'piano':
                instrument_number = 0
            elif input_name_no_filetype == 'strings':
                instrument_number = 48
            elif input_name_no_filetype == 'vocals':
                instrument_number = 52
            elif input_name_no_filetype == 'wind':
                instrument_number = 73
            else: # the 'other' file
                instrument_number = 0

            self.wav_to_midi(input_name_wav, wav_dir, midi_dir, instrument_number, is_drum)
            self.midi_to_pdf(input_name_midi, midi_dir, pdf_dir, '/usr/bin/mscore3')
    
    #### get lyrics for audio ####

    def get_lyrics(self, model_size, filename, expected_language):
        # model = whisper.load_model(model_size, device="cuda")
        model = whisper.load_model(model_size) #^ no gpu for now
        result = model.transcribe(filename)

        lyrics_array = []
        output_filename = filename.split('.')[0] + '_lyrics.json'
        # parent_directory = ".."
        # output_filepath = os.path.join(parent_directory, output_filename) # because we are using vocals.wav, which is in the processed_wav folder, to avoid confusion we move it one folder back into server/

        if result['language'] != expected_language: # acronyms such as en, zh, de (english, chinese, german)
            lyrics_array.append("(could not get lyrics)")
        else:
            for line_dict in result['segments']:
                lyrics_array.append(line_dict['text'])
        
        return_dict = {"lyrics_array": lyrics_array}

        with open(output_filename, 'w') as outfile:
            json.dump(return_dict, outfile, indent=4)
        
        destination = os.path.join('.', "lyrics_text.json")
        shutil.move(output_filename, destination)
        print(f'Lyrics file moved to {destination}')