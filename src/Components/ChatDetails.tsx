import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../backend/firebaseAuth";
import { useEffect, useState } from "react";

interface ChatListProp {
  chatId: string;
  toCloseChatDetails?: () => void;
  className?: string
}

interface User {
  id: string;
  name: string;
}

function ChatDetails({ chatId, toCloseChatDetails }: ChatListProp) {

  const [userData, setUserData] = useState<User | null>(null)

  useEffect(() => {

    const getUserDetails = async () => {
      try {
        const q = query(collection(db, "users"))
        const querySnapshot = await getDocs(q)

        const doc = querySnapshot.docs.find(doc => doc.id === chatId)

        if (doc) {
          const data = { id: doc.id, ...doc.data() } as User
          setUserData(data)
        }
        else {
          console.log("User Details Not found");
          setUserData(null)
        }
      }
      catch (err) {
        console.error("Error Occured while getting user details", err);
      }
    }
    console.log(userData);

    getUserDetails()
  }, [chatId, userData])


  return (
    <div className={`bg-gray-900 text-white h-screen w-full sm:w-[45%] lg:w-[25%] fixed sm:relative top-0 right-0 z-50 sm:z-auto transform transition-transform duration-300 ease-in-out`}>
      {/* Header */}
      <div className='p-3 sm:p-4 border-b border-gray-800 flex items-center justify-between'>
        <h1 className='text-xl sm:text-2xl font-semibold'>Chat Details</h1>

        {/* Close button for mobile and tablet */}
        <button
          className='lg:hidden p-2 hover:bg-gray-800 rounded-full transition-colors duration-200'
          onClick={() => toCloseChatDetails}
          aria-label="Close chat details"
        >
          <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
          </svg>
        </button>
      </div>

      {/* Profile Section */}
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col items-center'>
          <div className='relative'>
            <img
              className='w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 brightness-50 rounded-full border-4 border-gray-700'
              src="/profile-icon.png"
              alt="Contact profile"
            />
            {/* Online status */}
            <div className='absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full'></div>
          </div>

          <div className='text-center mt-4 sm:mt-6'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-semibold'>Contact 1</h1>
            <p className='text-base sm:text-lg text-zinc-400 mt-2'>Online</p>

            {/* Quick action buttons */}
            <div className='flex gap-4 mt-4 sm:mt-6'>
              <button className='bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' clipRule='evenodd' />
                </svg>
              </button>
              <button className='bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                </svg>
              </button>
              <button className='bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z' clipRule='evenodd' />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className='border-t border-gray-800 flex-1 overflow-y-auto scrollbar-hide'>
        <div className='p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8'>
          {/* About Section */}
          <div>
            <h2 className='text-lg sm:text-xl lg:text-2xl font-semibold mb-2 flex items-center'>
              <svg className='w-5 h-5 mr-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
              </svg>
              About
            </h2>
            <p className='text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed'>
              {/* About the contact - This is a longer description that explains more about this person and their interests. */}
            </p>
          </div>

          {/* Email Section */}
          <div>
            <h2 className='text-lg sm:text-xl lg:text-2xl font-semibold mb-2 flex items-center'>
              <svg className='w-5 h-5 mr-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
              </svg>
              Email
            </h2>
            <p className='text-base sm:text-lg lg:text-xl text-gray-300'>
              contact1@example.com
            </p>
          </div>

          {/* Phone Section */}
          <div>
            <h2 className='text-lg sm:text-xl lg:text-2xl font-semibold mb-2 flex items-center'>
              <svg className='w-5 h-5 mr-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
              </svg>
              Phone
            </h2>
            <p className='text-base sm:text-lg lg:text-xl text-gray-300'>
              +1 (555) 123-4567
            </p>
          </div>

          {/* Media Section */}
          {/* <div>
            <h2 className='text-lg sm:text-xl lg:text-2xl font-semibold mb-4 flex items-center'>
              <svg className='w-5 h-5 mr-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
              </svg>
              Shared Media
            </h2>
            <div className='grid grid-cols-3 gap-2'>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className='aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200 cursor-pointer'>
                  <svg className='w-6 h-6 text-gray-500' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                  </svg>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='border-t border-gray-800 p-4 flex justify-between bg-gray-900'>
        <div className='flex gap-2'>
          <button className='p-3 hover:bg-gray-800 rounded-full transition-colors duration-200 group' title="Mute notifications">
            <img className='w-5 h-5 sm:w-6 sm:h-6 group-hover:brightness-125' src="/mute.png" alt="Mute" />
          </button>
          <button className='p-3 hover:bg-gray-800 rounded-full transition-colors duration-200 group' title="Block contact">
            <img className='w-5 h-5 sm:w-6 sm:h-6 group-hover:brightness-125' src="/block.png" alt="Block" />
          </button>
        </div>

        <button className='p-3 hover:bg-red-800 rounded-full transition-colors duration-200 group' title="Delete conversation">
          <img className='w-5 h-5 sm:w-6 sm:h-6 group-hover:brightness-125' src="/delete.png" alt="Delete" />
        </button>
      </div>
    </div>
  )
}

export default ChatDetails