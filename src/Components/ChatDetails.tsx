
function ChatDetails() {
  return (
    <div className='bg-gray-900 text-white h-screen w-[25%]'>
      <div className='p-3 border-b-1 border-gray-800'>
        <h1 className='text-2xl ps-2 font-semibold'>Chat Details</h1>
      </div>

      <div className='p-4'>
        <img className='w-48 mt-15 m-auto brightness-50 rounded-full' src="profile-icon.png" alt="" />
        <div className='text-center p-4'>
          <h1 className='text-4xl ps-4 '>Contact 1</h1>
          <p className='text-lg ps-4 text-zinc-400'>State</p>
        </div>
      </div>

      <div className='border-t-1 border-gray-800 h-[47%]'>
        <div className='px-8 pt-8'>
          <h1 className='text-2xl'>About</h1>
          <p className='text-xl text-gray-300'>About the contact</p>
        </div>
        <div className='px-8 pt-8'>
          <h1 className='text-2xl'>Email</h1>
          <p className='text-xl text-gray-300'>Email of the contact</p>
        </div>
      </div>

      <div className='border-t-1 border-gray-800 p-2 flex justify-between'>
        <div className='flex'>
          <img className='p-2' src="mute.png" alt="" />
          <img className='p-2' src="block.png" alt="" />
        </div>
        <img className='p-2' src="delete.png" alt="" />
      </div>
    </div>
  )
}

export default ChatDetails