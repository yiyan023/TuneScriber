import React from 'react'
import { motion } from 'framer-motion'
import Music from '../public/img/score.png'

const Banner = () => {
	const container = {
		hidden: { opacity: 0, y: 50 },
		show: {
		  opacity: 0.9,
		  y: 0,
		  transition: {
			duration: 1,
			ease: "easeOut",
		  },
		},
	};

	return (
		<motion.div 
			className='bg-white bg-opacity-20 p-5 rounded-3xl m-10 fixed sm:top-2/3 top-3/4'
			variants={container}
			initial="hidden"
			animate="show"
		>
			<img src={Music} className='h-100 mx-auto rounded-2xl'/>
		</motion.div>
	)
}

export default Banner