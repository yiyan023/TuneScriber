# TuneScriber 🎶

## Inspiration ✨
For many people, playing music serves as a language where they can communicate complex feelings and relive their most cherished memories. It has remained a therapeutic medium for centuries, where people can express their vulnerabilities and seek comfort among others. However, accessing sheet music is challenging for several musicians due to the high cost of music libraries and the difficulty of transcribing music. Thus, I created TuneScriber, a web app that allows users to convert their favourite songs into sheet music! It separates the audio into distinct tracks based on instrumentation, which provides musical education more accessible to musical groups and solo musicians alike.

## What does it do? 👩‍💻
Simply upload your audio file and watch the magic happen! This product will split the audio into distinct tracks, enabling you to play each part separately, preview the sheet music, and download it as a PDF file.

## How was it built? 🔧
- I used **React**, **TailwindCSS**, and **Framer Motion** to create a scalable project that provides an interactive and responsive experience for everyone!
- **Flask** was used for server-side integration by sending the audio file to the backend for track separation, audio-to-MIDI conversion and sheet music generation.
- I used **Music.ai** to split the song into individual tracks based on instrumentation, including vocal, bass, string, and more!
- Next, the generated track files are fed into **Basic Pitch** for MIDI conversion, which enables easy editing and integration with other music production software (i.e. MuseScore).
- Finally, these MIDI files were converted into sheet music using **Mido**, which provides musicians with a visual representation of music with traditional notation. I also used **Whisper.ai** for reliable lyric generation, where arrays of verses are routed to the frontend so musicians can enjoy their favourite songs.

Check out my demo video here: https://drive.google.com/file/d/1oFRm2GzZL6RhDWPMNlYBwds8h-xtpKI5/view?usp=sharing
