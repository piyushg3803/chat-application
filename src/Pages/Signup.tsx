import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { googleLogin, signIn } from '../backend/authUtil';

function Signup() {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        try {

            if (!email || !password) {
                setError('Email and Password required');
                return;
            }

            await signIn(email, password)
            navigate('/Chat')
            alert('user signed in succesfully')
        }
        catch (error) {
            setError('Failed to create account');
            alert("Failed to create the user account")
            console.log(error)
        }
    }

    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await googleLogin();
            navigate('/Chat')
            alert('user signed in succesfully');
        }
        catch (error) {
            setError('Failed to login!');
            alert('Failed to create user account')
            console.log(error)
        }
    }

    return (

        <div className='bg-gray-950 h-screen flex'>
            <div className='m-auto bg-gray-900 border-solid border-2 border-gray-800 rounded-4xl w-xl text-center p-4'>
                <img className='w-20 m-auto my-10' src="chat-logo.png" alt="" />

                <div className='bg-gray-950 flex justify-center w-84 m-auto rounded-full text-white my-8'>
                    <div className='bg-gray-900 p-4 rounded-full m-1 w-42'>Sign Up</div>
                    <div className='p-4 rounded-full m-1 w-42 cursor-pointer'><NavLink to={'/Login'}>Log In</NavLink></div>
                </div>

                <h1 className='text-4xl text-white'>Create Your Account!</h1>
                <p className='text-gray-400'>Already have an Account? <NavLink className='font-bold' to={'/Login'}>Log In</NavLink></p>

                <div onClick={handleGoogleLogin} className='flex justify-center items-center mx-auto my-6 p-1 border-2 w-84 rounded-xl border-gray-600 cursor-pointer'>
                    <img src="google.png" className='w-6 m-2' alt="" />
                    <p className='text-xl text-white'>Continue with Google</p>
                </div>

                <p className='text-gray-400'>OR</p>

                <div className='w-84 m-auto my-8'>
                    <div className='bg-gray-950 text-gray-300 flex p-1 my-2 rounded-lg justify-left w-full'>
                        <img className='w-6 m-2' src="mail.png" alt="" />
                        <input className='outline-0 w-full' type="email" placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className='bg-gray-950 text-gray-300 flex p-1 my-3 rounded-lg justify-left w-full'>
                        <img className='w-6 m-2' src="user.png" alt="" />
                        <input className='outline-0 w-full' type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className='bg-gray-950 text-gray-300 flex p-1 my-3 rounded-lg justify-left w-full'>
                        <img className='w-6 m-2' src="password.png" alt="" />
                        <input className='outline-0 w-full' type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className='my-6'>
                        <button onClick={handleSignUp} className='bg-white text-black p-3 w-full font-semibold rounded-xl cursor-pointer'>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>


    )
}

export default Signup