import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { googleLogin, logIn } from '../backend/authUtil';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await logIn(email, password);
            // await completeProfile()
            navigate('/chats')
            alert('User Logged in Successfully')
        }
        catch (error) {
            setError('Error Occured')
            console.log(error);

        }
    }

    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await googleLogin();
            navigate('/chats');
            alert('User Logged in Successfully')
        }
        catch (error) {
            setError('Error Occured');
            console.log(error);
        }
    }

    return (
        <div className='bg-gray-950 min-h-screen flex items-center justify-center p-4'>
            <div className='bg-gray-900 border-2 border-gray-800 rounded-3xl w-full max-w-md mx-auto text-center p-6 sm:p-8'>

                {error && (
                    <div className='bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg mb-6 text-sm'>
                        Error occurred while loading the signup page
                    </div>
                )}

                <img
                    className='w-16 sm:w-20 mx-auto mb-8'
                    src="chat-logo.png"
                    alt="Chat Logo"
                />

                <div className='bg-gray-950 flex justify-center rounded-full text-white mb-8 p-1'>
                    <div className='py-3 px-6 me-1 rounded-full flex-1 cursor-pointer text-sm sm:text-base hover:bg-gray-800 transition-colors'>
                        <NavLink to={'/'}>Sign Up</NavLink>
                    </div>
                    <div className=' bg-gray-900 py-3 px-6 rounded-full flex-1 text-sm sm:text-base'>
                        Log In
                    </div>
                </div>

                <h1 className='text-2xl sm:text-3xl lg:text-4xl text-white mb-2 font-bold'>Welcome Back!</h1>
                <p className='text-gray-400 text-sm sm:text-base mb-6'>Don't have an Account? <NavLink className='font-bold text-white hover:text-gray-300 ml-1' to={'/'}>Sign Up</NavLink></p>

                <button
                    onClick={handleGoogleLogin}
                    className='flex justify-center items-center w-full p-3 border-2 border-gray-600 rounded-xl cursor-pointer hover:border-gray-500 hover:bg-gray-800 transition-all duration-200 mb-6'
                >
                    <img src="google.png" className='w-5 sm:w-6 mr-3' alt="Google" />
                    <span className='text-base sm:text-lg text-white'>Login with Google</span>
                </button>

                <div className='flex items-center mb-6'>
                    <div className='flex-1 h-px bg-gray-600'></div>
                    <span className='px-4 text-gray-400 text-sm sm:text-base'>OR</span>
                    <div className='flex-1 h-px bg-gray-600'></div>
                </div>

                <div className='space-y-2 mb-6'>
                    <div className='bg-gray-950 text-gray-300 flex items-center p-3 rounded-lg w-full'>
                        <img className='w-5 sm:w-6 mr-3 flex-shrink-0' src="mail.png" alt="Email" />
                        <input
                            className='outline-none w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base'
                            type="email"
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='bg-gray-950 text-gray-300 flex items-center p-3 rounded-lg w-full'>
                        <img className='w-5 sm:w-6 mr-3 flex-shrink-0' src="password.png" alt="Password" />
                        <input
                            className='outline-none w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base'
                            type="password"
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className='my-6 max-sm:my-4'>
                        <button onClick={handleLogin} className='bg-white text-black p-3 w-full font-semibold rounded-xl cursor-pointer'>Log In</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login