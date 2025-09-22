import { useEffect, useState } from 'react'
import { logOut } from '../backend/authUtil'
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../Context/authContext';
import { db } from '../backend/firebaseAuth';
import { useMediaQuery } from 'react-responsive';

interface User {
  id: string;
  uid?: string;
  name?: string;
}

interface ChatListProps {
  userName: (userName: string, userId: string) => void;
  chatId?: string;
  toggleChat: () => void;
}

function ChatList({ userName, chatId, toggleChat }: ChatListProps) {
  const [openMenu, setOpenmenu] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isMobile = useMediaQuery({ maxWidth: 641 });

  const handleUsername = (user: User) => {
    userName(user.name || 'Anonymous', user.id)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)

      if (!currentUser?.uid) {
        console.log('No current user found');
        setLoading(false)
        return;
      }

      try {
        const q = query(
          collection(db, "users"));
        const querySnapshot = await getDocs(q);
        console.log("Snapshot Size", querySnapshot.size);

        const usersList: User[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<User, "id">;
          return {
            id: doc.id,
            ...data,
          };
        })
          .filter(user => user.id !== currentUser.uid)

        console.log("User List", usersList);
        setUsers(usersList);
      } catch (error: any) {
        console.error("Error Fetching Users:", {
          errorCode: error.code,
          errorMessage: error.message,
          stack: error.stack
        });
        setError(true);
      }
      finally {
        setLoading(false)
      }
    };
    fetchUsers();
  }, [currentUser?.uid]);

  const handlelogout = async () => {
    try {
      await logOut();
      alert('User Logged Out Successfully');
      navigate('/')
    }
    catch (error) {
      setError(true)
      console.log(error);
    }
  }

  const showMenu = () => {
    setOpenmenu(!openMenu)
  }


  return (

    <div className={`relative bg-gray-900 text-white h-screen w-full sm:w-1/2 lg:w-[35%]`}>
      {/* Header */}
      <div className='p-3 sm:p-4 flex items-center justify-between border-b border-gray-800'>
        <div className='flex items-center'>
          <img className='w-6 h-6 sm:w-8 sm:h-8' src="chat.png" alt="Chat" />
          <h1 className='text-xl sm:text-2xl ps-3 sm:ps-4 font-semibold'>Chats</h1>
        </div>
        <div className='p-2'>
          <img className='w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70' src="search.png" alt="Search" />
        </div>
      </div>

      {/* Chat List Container */}
      <div className='h-[calc(100vh-140px)] sm:h-[calc(100vh-150px)] overflow-y-auto scrollbar-hide'>
        {loading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2'></div>
              <p className='text-sm sm:text-base'>Loading Chat List...</p>
            </div>
          </div>
        ) : error ? (
          <div className='text-red-400 p-4 text-center bg-red-900/20 border border-red-500 rounded-lg m-4'>
            <p className='text-sm sm:text-base'>{error}</p>
          </div>
        ) : !users || users.length === 0 ? (
          <div className='text-center p-6 sm:p-8'>
            <div className='text-gray-400 mb-4'>
              <svg className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z' clipRule='evenodd' />
              </svg>
            </div>
            <p className='text-sm sm:text-base text-gray-400'>No chats found</p>
            <p className='text-xs sm:text-sm text-gray-500 mt-2'>Start a conversation to see your chats here</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-800'>
            {users.map((user) => (
              {
                isMobile ? (<Link
                to = {`/chats/chatspace`}
                key = { user.id }
                onClick = {() => handleUsername(user)}
            className='p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 active:bg-gray-800 transition-colors duration-200 chatBtn'
              >
            <div className='flex items-center flex-1 min-w-0'>
              <div className='relative flex-shrink-0'>
                <img
                  className='w-10 h-10 sm:w-12 sm:h-12 rounded-full brightness-75'
                  src="profile-icon.png"
                  alt={`${user.name || 'Anonymous'}'s profile`}
                />
                {/* Online status indicator - you can add logic for this */}
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full'></div>
              </div>

              <div className='ml-3 sm:ml-4 flex-1 min-w-0'>
                <h2 className='text-base sm:text-lg font-medium truncate'>
                  {user.name || 'Anonymous'}
                </h2>
                <p className='text-xs sm:text-sm text-gray-400 truncate'>
                  Last Message Preview...
                </p>
              </div>
            </div>

            <div className='flex-shrink-0 ml-2 text-right'>
              <p className='text-xs text-gray-500 mb-1'>12:30 PM</p>
              {/* Unread message count - add logic as needed */}
              <div className='w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ml-auto'>
                <span className='text-xs text-white'>2</span>
              </div>
            </div>
          </Link>) : (< div
            key={user.id}
            onClick={() => handleUsername(user)}
            className='p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 active:bg-gray-800 transition-colors duration-200 chatBtn'
          >
          <div className='flex items-center flex-1 min-w-0'>
            <div className='relative flex-shrink-0'>
              <img
                className='w-10 h-10 sm:w-12 sm:h-12 rounded-full brightness-75'
                src="profile-icon.png"
                alt={`${user.name || 'Anonymous'}'s profile`}
              />
              {/* Online status indicator - you can add logic for this */}
              <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full'></div>
            </div>

            <div className='ml-3 sm:ml-4 flex-1 min-w-0'>
              <h2 className='text-base sm:text-lg font-medium truncate'>
                {user.name || 'Anonymous'}
              </h2>
              <p className='text-xs sm:text-sm text-gray-400 truncate'>
                Last Message Preview...
              </p>
            </div>
          </div>

          <div className='flex-shrink-0 ml-2 text-right'>
            <p className='text-xs text-gray-500 mb-1'>12:30 PM</p>
            {/* Unread message count - add logic as needed */}
            <div className='w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ml-auto'>
              <span className='text-xs text-white'>2</span>
            </div>
          </div>
        </div>)}
            ))}
      </div>
        )}
    </div>

      {/* Bottom Profile Section */ }
  <div className='absolute bottom-0 left-0 right-0 border-t border-gray-800 p-3 sm:p-4 bg-gray-900'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center flex-1 min-w-0'>
        <img
          className='w-8 h-8 sm:w-10 sm:h-10 rounded-full brightness-75 flex-shrink-0'
          src="profile-icon.png"
          alt="Your profile"
        />
        <div className='ml-3 flex-1 min-w-0 hidden sm:block'>
          <p className='text-sm font-medium text-white truncate'>Your Name</p>
          <p className='text-xs text-gray-400'>Online</p>
        </div>
      </div>

      <div className='relative'>
        <button
          onClick={showMenu}
          className='p-2 hover:bg-gray-800 rounded-full transition-colors duration-200'
          aria-label="Settings menu"
        >
          <img className='w-5 h-5 sm:w-6 sm:h-6' src="settings.png" alt="Settings" />
        </button>

        {/* Settings Menu */}
        <div className={`absolute ${!openMenu ? 'hidden' : 'block'} bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[120px] z-50`}>
          <ul className='py-2'>
            <li>
              <button
                onClick={handlelogout}
                className='w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-200 flex items-center'
              >
                <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z' clipRule='evenodd' />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
    </div >
  )
}

export default ChatList