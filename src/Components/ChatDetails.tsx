import { doc, onSnapshot, } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../backend/firebaseAuth";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { deleteConversation } from "../backend/chatUtil";
import { getAuth } from "@firebase/auth";

interface ChatListProp {
  userData: { profileImg: string, displayName: string, id: string, email: string, lastSeen: string, about: string, location: string, createdAt: string }
  showDetails: boolean
  setShowDetails: (show: boolean) => void;
}

function ChatDetails({ showDetails, setShowDetails, userData }: ChatListProp) {
  const isMobile = useMediaQuery({ maxWidth: 641 })
  const location = useLocation();
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState<{ displayName: string; online: boolean; lastSeen: string; location: string; about: string; createdAt: string }>({
    displayName: "Username",
    online: false,
    lastSeen: 'Offline',
    about: "About the user!",
    location: "Where user lives",
    createdAt: "When user joined the ChatApp"
  })

  const auth = getAuth()
  const currentUser = auth.currentUser?.uid

  useEffect(() => {
    if (isMobile && (!location.state || location.state?.from === "chatspace")) {
      navigate('/chats/chatspace')
    }
  }, [])

  useEffect(() => {
    if (!userData?.id) return;

    const userRef = doc(db, "users", userData?.id)

    console.log("user ref", userRef);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const lastSeenTimeStamp = data.lastSeen.toDate()

        console.log("user from the details", data);

        let formattedLastSeen = 'Offline'

        if (data.online) {
          formattedLastSeen = "Online"
        }
        else if (lastSeenTimeStamp) {
          if (isToday(lastSeenTimeStamp)) {
            formattedLastSeen = `Last seen ${formatDistanceToNow(lastSeenTimeStamp, { addSuffix: true })}`
          }
          else if (isYesterday(lastSeenTimeStamp)) {
            formattedLastSeen = `Last seen yesterday ${format(lastSeenTimeStamp, 'h:mm aaa')}`
          }
          else {
            formattedLastSeen = `Last seen ${format(lastSeenTimeStamp, 'h:mm aaa')}`
          }
        }

        setUserStatus({
          displayName: data.displayName,
          online: data.online || false,
          lastSeen: formattedLastSeen,
          about: data.about,
          location: data.location,
          createdAt: data.createdAt
        })
        console.log("user created", data.createdAt);
      }
    })
    return () => unsubscribe()
  }, [userData?.id])

  const closeChatDetails = () => {
    setShowDetails(false)
    if (isMobile) {
      navigate('/chats/chatspace', { replace: true })
    }
  }

  // Helper function to convert Firestore Timestamp to readable date
  const formatFirestoreDate = (timestamp: any): string => {
    try {
      // Handle Firestore Timestamp object
      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      // Handle ISO string
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }

      // Handle Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      return 'Recently';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const deleteChat = async () => {
    try {
      await deleteConversation([currentUser, userData?.id].sort().join('_'))
      console.log(userData.id);
      alert("Conversation deleted!")
      navigate('/chats')
      console.log("Error Occured while deleteing this confo");

    }
    catch (error) {
      console.log("Error deleting the conversation", error);
    }
  }

  return (
    <>
      <div className={`${showDetails ? 'translate-x-0' : 'translate-x-full'} border-l-2 border-zinc-800 bg-zinc-950 text-white h-screen w-full sm:w-[45%] lg:w-[30%] fixed top-0 right-0 z-50 transform transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <div className='p-4 flex items-center justify-between bg-zinc-900/50'>
          <h1 className='text-xl sm:text-2xl font-bold'>Contact Info</h1>

          <button
            className='p-2 hover:bg-zinc-700 rounded-full transition-all duration-200 active:scale-95'
            onClick={closeChatDetails}
            aria-label="Close chat details"
          >
            <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
            </svg>
          </button>
        </div>

        {/* Profile Section */}
        <div className='p-6 sm:p-8 border-b border-zinc-700 bg-zinc-950/30 to-transparent'>
          <div className='flex flex-col items-center'>
            <div className='relative group'>
              <img
                className='w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-zinc-700 object-cover shadow-xl group-hover:border-zinc-600 transition-all duration-300'
                src={userData.profileImg || "/profile-icon.png"}
                alt={`${userData.displayName}'s profile`}
              />

              {/* Online status indicator */}
              {userStatus.online ? (
                <div className='absolute bottom-2 right-2 sm:bottom-4 sm:right-4'>
                  <div className='w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-4 border-zinc-900 rounded-full'></div>
                </div>
              ) : (
                <div className='absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-zinc-600 border-4 border-gray-900 rounded-full'></div>
              )}
            </div>

            <div className='text-center mt-6'>
              <h2 className='text-2xl sm:text-3xl font-bold mb-2'>
                {userData.displayName || 'Unknown User'}
              </h2>
              <p className='text-sm sm:text-base text-zinc-400 flex items-center justify-center gap-2'>
                {userStatus.online ? (
                  <>
                    <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                    Online
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                    </svg>
                    {`Last seen ${userStatus.lastSeen}`}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information - Scrollable */}
        <div className='flex-1 overflow-y-auto scrollbar-hide'>
          <div className='p-4 sm:p-6 space-y-6'>
            {/* About Section */}
            {userData.about && (
              <div className='bg-zinc-800/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors duration-200'>
                <h3 className='text-sm font-semibold text-zinc-400 mb-2 flex items-center'>
                  <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                  </svg>
                  About
                </h3>
                <p className='text-base text-zinc-200 leading-relaxed'>
                  {userData.about}
                </p>
              </div>
            )}

            {/* Email Section */}
            <div className='bg-zinc-800/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors duration-200'>
              <h3 className='text-sm font-semibold text-zinc-400 mb-2 flex items-center'>
                <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
                Email
              </h3>
              <p className='text-base text-zinc-200 break-all'>
                {userData.email || 'Not provided'}
              </p>
            </div>

            {/* Location Section */}
            {userData.location && (
              <div className='bg-zinc-800/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors duration-200'>
                <h3 className='text-sm font-semibold text-zinc-400 mb-2 flex items-center'>
                  <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                  </svg>
                  Location
                </h3>
                <p className='text-base text-zinc-200'>
                  {userData.location}
                </p>
              </div>
            )}

            {userData.createdAt && (
              <div className='text-center py-4'>
                <p className='text-sm text-zinc-500 opacity-60'>
                  Joined {formatFirestoreDate(userData.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className='p-6 bg-zinc-900/50 backdrop-blur-sm'>
          <div className='flex justify-between items-center gap-3'>
            <button className='flex-1 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group'>
              <svg className='w-5 h-5 text-zinc-400 group-hover:text-white transition-colors' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium hidden sm:inline'>Mute</span>
            </button>

            <button className='flex-1 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group'>
              <svg className='w-5 h-5 text-zinc-400 group-hover:text-white transition-colors' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium hidden sm:inline'>Block</span>
            </button>

            <button className='flex-1 bg-red-900/50 hover:bg-red-800 p-3 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group'
              onClick={deleteChat}>
              <svg className='w-5 h-5 text-red-400 group-hover:text-white transition-colors' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium hidden sm:inline'>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatDetails