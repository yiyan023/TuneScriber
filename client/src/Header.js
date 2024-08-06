import React from 'react'
import Logo from './public/img/logo.png'
import { useNavigate } from 'react-router-dom'

const Header = () => {
	const navigate = useNavigate();

	return (
		<button 
			className='fixed top-5 left-5 flex items-center justify-center'
			onClick={() => {navigate('/')}}
		>
			<img src={Logo} className='w-10 font-inter mr-2'/>
			<p className='text-medium'>TuneScriber</p>
		</button>
	)
}

export default Header