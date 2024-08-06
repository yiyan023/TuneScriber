import React from 'react'
import Upload from './Upload'
import Banner from './Banner'

const Home = () => {
  return (
	<div className='flex flex-col justify-center items-center overflow-hidden no-scroll'>
		<Upload />
		<Banner />
	</div>
  )
}

export default Home