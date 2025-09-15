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
            navigate('/Chat')
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
            navigate('/Chat');
            alert('User Logged in Successfully')
        }
        catch (error) {
            setError('Error Occured');
            console.log(error);
        }
    }

    return (
        <div className='bg-gray-950 h-screen flex'>
            <div className='m-auto bg-gray-900 border-solid border-2 border-gray-800 rounded-4xl w-xl text-center p-4'>
                <img className='w-20 m-auto my-10' src="chat-logo.png" alt="" />

                <div className='bg-gray-950 flex justify-center w-84 m-auto rounded-full text-white my-8'>
                    <div className='p-4 rounded-full m-1 w-42 cursor-pointer'><NavLink to={'/'}>Sign Up</NavLink></div>
                    <div className='bg-gray-900  p-4 rounded-full m-1 w-42'>Log In</div>
                </div>

                <h1 className='text-4xl text-white'>Welcome Back!</h1>
                <p className='text-gray-400'>Don't have an Account? <NavLink className='font-bold' to={'/'}>Sign Up</NavLink></p>

                <div onClick={handleGoogleLogin} className='flex justify-center items-center mx-auto my-6 p-1 border-2 w-84 rounded-xl border-gray-600 cursor-pointer'>
                    <img src="google.png" className='w-6 m-2' alt="" />
                    <p className='text-xl text-white'>Login with Google</p>
                </div>

                <p className='text-gray-400'>OR</p>

                <div className='w-84 m-auto my-8'>
                    <div className='bg-gray-950 text-gray-300 flex p-1 my-2 rounded-lg justify-left w-full'>
                        <img className='w-6 m-2' src="mail.png" alt="" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className='outline-0 w-full' type="email" placeholder='Email Address' />
                    </div>
                    <div className='bg-gray-950 text-gray-300 flex p-1 my-3 rounded-lg justify-left w-full'>
                        <img className='w-6 m-2' src="password.png" alt="" />
                        <input value={password} onChange={(e) => setPassword(e.target.value)} className='outline-0 w-full' type="password" placeholder='Password' />
                    </div>

                    <div className='my-6'>
                        <button onClick={handleLogin} className='bg-white text-black p-3 w-full font-semibold rounded-xl cursor-pointer'>Log In</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login