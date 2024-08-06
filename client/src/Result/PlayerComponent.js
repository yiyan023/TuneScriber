import React, { useRef, useState, useEffect } from 'react';
import './styles.css';
import { Slider } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import PreviewPDF from './PreviewPDF';

function PlayerComponent({ fileName, audioSrc, delay, pdf}) {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [showModal, setShowModal] = useState(false); 

	useEffect(() => {
		if (audioRef.current) {
		audioRef.current.ontimeupdate = () => {
			setCurrentTime(audioRef.current.currentTime);
		};
		audioRef.current.onloadedmetadata = () => {
			setDuration(audioRef.current.duration);
		};
		}
	}, []);

	const togglePlayPause = () => {
		if (audioRef.current.paused) {
		audioRef.current.play();
		setIsPlaying(true);
		} else {
		audioRef.current.pause();
		setIsPlaying(false);
		}
	};

	const handleSliderChange = (value) => {
		audioRef.current.currentTime = (value[0] / 100) * duration;
	};

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};

	const handleDownload = () => {
		const link = document.createElement('a');
		link.href = pdf;
		link.download = `${fileName.replace('.wav', '.pdf')}`;
		document.body.appendChild(link);
    	link.click();
    	document.body.removeChild(link);
	}

	return (
		<motion.div
		className="flex flex-col items-start"
		initial={{ opacity: 0, y: 50 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, ease: "easeOut", delay }}
		>
		<div className="text-sm flex font-medium mb-1 opacity-70">{fileName.split('.').slice(0, -1).join('.')}</div>
		<div className="p-6 block w-full max-w-2xl bg-white border border-white rounded-lg bg-blend-overlay opacity-100 bg-opacity-10 border-opacity-30">
			<div>
			<div className="flex justify-between">
				<div className="text-xs opacity-80">{fileName}</div>
				<div className="text-xs opacity-80">{formatTime(currentTime)} / {formatTime(duration)}</div>
			</div>
			<div className="flex items-center mt-2">
				<button onClick={togglePlayPause} className="mr-2">
				{isPlaying ? (
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M3.5 1.5H5.5V13.5H3.5V1.5ZM9.5 1.5H11.5V13.5H9.5V1.5Z" fill="currentColor" />
					</svg>
				) : (
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
					</svg>
				)}
				</button>
				<Slider
				className="custom-slider"
				defaultValue={[0]}
				value={[((currentTime / duration) * 100) || 0]}
				onValueChange={handleSliderChange}
				color="plum"
				size=""
				/>
			</div>
			<audio ref={audioRef} src={audioSrc}></audio>
			</div>
			<div className="mt-4 flex space-x-2 max-w-2xl ">
			<button 
				className="custom-button outline opacity-80"
				onClick={() => setShowModal(true)}
			>
				Preview PDF
			</button>
			<button className="custom-button"
				onClick={handleDownload}
			>
				Download
			</button>
			</div>
		</div>
			{showModal && <PreviewPDF showModal={showModal} setShowModal={setShowModal} pdfSrc={pdf} />}
		</motion.div>
	);
}

export default PlayerComponent;