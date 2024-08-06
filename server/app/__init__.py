from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import zipfile
import io
import os
import shutil


from .music_processor import MusicProcessor


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    UPLOAD_FOLDER = './uploads'
    ALLOWED_EXTENSIONS = {'mp3', "wav"}

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000  # 16MB limit

    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.route('/upload', methods=["POST"])
    def upload():

        file = request.files['file']
        print(file)

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            # Ensure the upload folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'])
            print(f"Created directory {app.config['UPLOAD_FOLDER']}")
        file.save(filepath)
        return jsonify({'message': 'File uploaded successfully'}), 200

    @app.route('/')
    def index():
        return "Hello, World!"

    @app.route("/get-audio", methods=["GET"])
    def get_audio():
        file = "./say-short.mp3"
        return send_file(file, mimetype='audio/mpeg')

    @app.route('/separate', methods=["POST"])
    def separate_audio():
        if not os.path.exists("./processed_wav"):
            os.makedirs("./processed_wav")
            print("Created processed_wav directory")
        else:
            print("processed_wav directory already exists")

        file = request.files['file']
        print(file)

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            # Ensure the upload folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'])
            print(f"Created directory {app.config['UPLOAD_FOLDER']}")
        file.save(filepath)

        mp = MusicProcessor()
        status, result = mp.separate(filepath)

        print(status, "separated")

        processed_files = {}

        for instrument, url in result.items():
            mp.download(url, "./processed_wav", instrument + ".wav")
            processed_files[instrument] = instrument + ".wav"
            print(f"Downloaded {instrument} to processed_wav directory")

        processed_wav = {
            "bass": "bass.wav",
            "guitar": "guitar.wav",
            "keys": "keys.wav",
            "other": "other.wav",
            "piano": "piano.wav",
            "strings": "strings.wav",
            "vocals": "vocals.wav",
            "wind": "wind.wav"
        }

        processed_midi = {
            "bass": "bass.mid",
            "guitar": "guitar.mid",
            "keys": "keys.mid",
            "other": "other.mid",
            "piano": "piano.mid",
            "strings": "strings.mid",
            "vocals": "vocals.mid",
            "wind": "wind.mid"
        }

        processed_pdf = {
            "bass": "bass.pdf",
            "guitar": "guitar.pdf",
            "keys": "keys.pdf",
            "other": "other.pdf",
            "piano": "piano.pdf",
            "strings": "strings.pdf",
            "vocals": "vocals.pdf",
            "wind": "wind.pdf"
        }

        #### wav folder -> midi folder (.mid files) and pdf folder (.pdf and .musicxml files) ####
        print("Starting batch conversion of .wav files")
        mp.batch_wav_conversion("processed_wav", "processed_midi", "processed_pdf")
        print("Conversion complete")

        #### get lyrics for audio ####
        print("Start acquiring lyrics")
        mp.get_lyrics("medium", os.path.join("processed_wav", "vocals.wav"),"en")
        print("Lyrics acquiring complete")

        # zip
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w') as zf:
            for instrument, file in processed_wav.items():
                zf.write(os.path.join(".", "processed_wav", file), file)
            for instrument, file in processed_midi.items():
                zf.write(os.path.join(".", "processed_midi", file), file)
            for instrument, file in processed_pdf.items():
                zf.write(os.path.join(".", "processed_pdf", file), file)
            zf.write(os.path.join(".", "lyrics_text.json"))

        memory_file.seek(0)

        print("Processed files zipped")
        return send_file(path_or_file=memory_file, download_name='processed.zip', as_attachment=True)

    return app
