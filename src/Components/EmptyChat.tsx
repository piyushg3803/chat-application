import React from 'react'

function EmptyChat() {
  return (
    <div className='hidden sm:flex sm:w-1/2 lg:w-[65%] bg-gray-950 text-white h-screen flex-col items-center justify-center p-8 relative overflow-hidden -z-10'>
      <div className='text-center max-w-md mx-auto relative z-10'>
        <h1 className='text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'>
          Welcome to Chat
        </h1>
        <h2 className='text-xl lg:text-2xl text-gray-300 mb-6 font-medium'>
          Start a Conversation
        </h2>
        <p className='text-gray-400 text-base lg:text-lg leading-relaxed mb-8 max-w-sm mx-auto'>
          Select a chat from the sidebar to start messaging, or create a new conversation to connect with friends and colleagues.
        </p>
      </div>
    </div>
  )
}

export default EmptyChat