import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PlayerComponent from './PlayerComponent';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import LyricModal from './PreviewLyrics';

// Import images

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const textAnimation = {
  hidden: { opacity: 0, y: -50 },
  show: {
    opacity: 0.9,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [audioFiles, setAudioFiles] = useState({});
  const [pdfFiles, setPdfFiles] = useState({});
  const [lyrics, setLyrics] = useState(null);
  const [show, setShow] = useState(false);

  // Function to split files into audio and pdf categories
  const splitFiles = (files) => {
    const audio = {};
    const pdf = {};
    for (const fileName in files) {
      if (fileName.endsWith('.wav')) {
        audio[fileName] = files[fileName];
      } else if (fileName.endsWith('.pdf')) {
        pdf[fileName] = files[fileName];
      } else {
		setLyrics(files[fileName]);
	  }
    }
    setAudioFiles(audio);
    setPdfFiles(pdf);
  };

  const showLyrics = () => {
	setShow(true);
	console.log("Showing Lyrics", lyrics);
  }

  // Retrieve files from localStorage if they exist
  useEffect(() => {
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      const parsedFiles = JSON.parse(storedFiles);
      splitFiles(parsedFiles);
    }
  }, []);

  // Save files to localStorage if passed via location.state
  useEffect(() => {
    if (location.state && location.state.files) {
      const newFiles = location.state.files;
      splitFiles(newFiles);
      localStorage.setItem('files', JSON.stringify(newFiles));
    }
  }, [location.state]);

  return (
    <div className="mt-12 relative min-h-screen text-center text-white">
      <motion.h1
        className="text-5xl font-medium opacity-70 mb-8"
        variants={textAnimation}
        initial="hidden"
        animate="show"
      >
        Enjoy your sheet music!
      </motion.h1>
      <div className='mb-12'>
        <motion.div
          className="flex flex-col gap-6 overflow-y-auto max-h-medium pl-5 pr-5 mb-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {Object.keys(audioFiles).map((fileName, index) => (
            <PlayerComponent 
              key={index}
              fileName={fileName}
              audioSrc={audioFiles[fileName]} 
              pdf={pdfFiles[fileName.replace('.wav', '.pdf')]} // Pass the corresponding PDF file
              delay={index * 0.3} 
            />
          ))}
        </motion.div>
      </div>
	  <div className='flex flex-col justify-content items-center'>
		<button
			className='pr-5 pl-5 pt-2 text-opacity-100 text-white pb-2 rounded-lg border-white border border-opacity-100 hover:border-opacity-50 hover:text-opacity-50'
			onClick={showLyrics}
		>
			View Lyrics
		</button>
	  </div>
	  {show && (
		<LyricModal showModal={show} setShowModal={setShow} lyricSrc={lyrics}/>
	  )}
    </div>
  );
}

export default Result;
