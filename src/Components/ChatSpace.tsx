import React, { useEffect, useRef, useState } from 'react';
import { createOrGetChatRoom, listenMessages, sendMessage } from '../backend/chatUtil';
import { useAuth } from '../Context/authContext';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../backend/firebaseAuth';
import EmojiPicker from 'emoji-picker-react'
import '../index.css'

interface ChatSpaceProps {
   userData: { displayName: string, id: string, profileImg: string, email: string, online: string, createdAt: string };
   showDetails: boolean;
   setShowDetails: (show: boolean) => void;
   setShowChat: (show: boolean) => void;
}

interface Message {
   id: string;
   text: string;
   senderId: string;
   createdAt: Timestamp;
   seenBy: string[];
}

function ChatSpace({ userData, setShowDetails, showDetails, setShowChat }: ChatSpaceProps) {
   const { user: currentUser } = useAuth()
   const [searchTerm, setSearchTerm] = useState('')
   const [matchedIndexes, setMatchedIndexes] = useState<number[]>([]);
   const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
   const [filteredMsg, setFilteredMsg] = useState<Message[]>([])
   const [showSearch, setShowSearch] = useState(false)
   const [messages, setMessages] = useState<Message[]>([])
   const [YourMsg, setYourMsg] = useState('')
   const [showPicker, setShowPicker] = useState(false)
   const [chatRoomId, setChatRoomId] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();
   const [userStatus, setUserStatus] = useState<{ online: boolean; lastSeen: string; }>({
      online: false,
      lastSeen: 'Offline'
   });

   const isMobile = useMediaQuery({ maxWidth: 641 })
   const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

   useEffect(() => {
      if (!userData?.id) return;

      const userRef = doc(db, "users", userData.id);
      const unsubscribe = onSnapshot(userRef, (doc) => {
         if (doc.exists()) {
            const data = doc.data();
            const lastSeenTimestamp = data.lastSeen?.toDate();

            let formattedLastSeen = 'Offline';

            if (data.online) {
               formattedLastSeen = 'Online';
            } else if (lastSeenTimestamp) {
               if (isToday(lastSeenTimestamp)) {
                  formattedLastSeen = `Last seen ${formatDistanceToNow(lastSeenTimestamp, { addSuffix: true })}`;
               } else if (isYesterday(lastSeenTimestamp)) {
                  formattedLastSeen = `Last seen yesterday at ${format(lastSeenTimestamp, 'h:mm aaa')}`;
               } else {
                  formattedLastSeen = `Last seen ${format(lastSeenTimestamp, 'PPp')}`;
               }
            }

            setUserStatus({
               online: data.online || false,
               lastSeen: formattedLastSeen
            });
         }
      });

      return () => unsubscribe();
   }, [userData?.id]);

   console.log("user Status", userStatus);

   const pickerRef = useRef<HTMLDivElement>(null)

   const addEmoji = (emojiData: any) => {
      setYourMsg(prev => prev + emojiData.emoji)
   }

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
            setShowPicker(false)
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside)
   })

   const handleSearch = async (term: string) => {
      setSearchTerm(term);

      if (!term.trim()) {
         setFilteredMsg([]);
         return;
      }

      // Local filter first
      const localMatches = messages.filter(m =>
         m.text?.toLowerCase().includes(term.toLowerCase())
      );

      setFilteredMsg(localMatches)
   };

   const highlightSearch = (text: string, search: string) => {
      if (!search) return text;

      const regex = new RegExp(`(${search})`, "gi");
      const parts = text.split(regex);

      return parts.map((part, i) =>
         part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className="bg-yellow-300/40 px-1 rounded">{part}</span>
         ) : (
            part
         )
      );
   };

   useEffect(() => {
      if (!searchTerm.trim()) {
         setMatchedIndexes([]);
         setCurrentMatchIndex(0);
         return;
      }

      const matches = messages
         .map((msg, index) =>
            msg.text?.toLowerCase().includes(searchTerm.toLowerCase()) ? index : null
         )
         .filter((index): index is number => index !== null);

      setMatchedIndexes(matches);
      setCurrentMatchIndex(0);

      // Auto-scroll to the first match if available
      if (matches.length > 0) {
         const firstMatch = matches[0];
         const msgId = messages[firstMatch].id;
         messageRefs.current[msgId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
   }, [searchTerm, messages]);

   const goToNextMatch = () => {
      if (matchedIndexes.length === 0) return;
      const nextIndex = (currentMatchIndex + 1) % matchedIndexes.length;
      setCurrentMatchIndex(nextIndex);

      const msgId = messages[matchedIndexes[nextIndex]].id;
      messageRefs.current[msgId]?.scrollIntoView({ behavior: "smooth", block: "center" });
   };

   const goToPrevMatch = () => {
      if (matchedIndexes.length === 0) return;
      const prevIndex =
         (currentMatchIndex - 1 + matchedIndexes.length) % matchedIndexes.length;
      setCurrentMatchIndex(prevIndex);

      const msgId = messages[matchedIndexes[prevIndex]].id;
      messageRefs.current[msgId]?.scrollIntoView({ behavior: "smooth", block: "center" });
   }

   console.log("User Data from space", userData)

   // creating or retrieving the chatRoom
   useEffect(() => {
      const initializeChat = async () => {
         if (!userData.id || !currentUser?.uid) return;

         try {
            const chatRoom = await createOrGetChatRoom(currentUser.uid, userData.id);
            console.log("Chat Room Created/Retreived", chatRoom);
            setChatRoomId(chatRoom.id)
            console.log("Chat Room Id", chatRoom.id);
         }
         catch (error) {
            console.error("Error initializing chat:", error);
            setError("Failed to initialize chat!")
         }
      }

      if (userData.displayName && userData.id) {
         initializeChat();
      } else {
         console.log("Chat Could not be initialized");
      }

   }, [userData.displayName, userData.id, currentUser?.uid])

   // sending and retrieving the messages
   useEffect(() => {
      if (!chatRoomId) return;

      let unsubscribe: (() => void) | undefined;

      const setupMessageListener = async () => {
         try {
            unsubscribe = listenMessages(chatRoomId, (newMessage: Message[]) => {
               console.log('Received Message:', newMessage);
               setMessages(newMessage)
            });
         }
         catch (error) {
            console.error("Error listening the messages", error);
            setError('Failed to load messages')
         }
      };

      setupMessageListener();

      return () => {
         if (typeof unsubscribe === 'function') {
            unsubscribe();
         }
      };
   }, [chatRoomId])

   console.log("All Messages", messages);

   const groupedMsg = messages.reduce((group, msg) => {
      const date = msg.createdAt?.toDate();
      if (!date) return group

      let label = format(date, 'dd MMM yyyy');

      if (isToday(date)) label = 'Today';
      else if (isYesterday(date)) label = 'Yesterday';

      if (!group[label]) group[label] = [];
      group[label].push(msg);

      return group;
   }, {} as Record<string, Message[]>)

   console.log("GroupedMsg", groupedMsg);

   const handleUserClick = () => {
      navigate('/chats')
      setShowChat(false)
   }

   console.log("Show Details from the ChatSpace", showDetails);

   const handleDetailsClick = () => {
      if (isMobile) {
         setShowDetails(true)
         navigate('chatdetails', { replace: true, state: { from: 'chatspace' } });
         console.log("details triggered in mobile");
         // console.log("From Mobile", showDetails);
      }
      else {
         console.log("details triggered desktop ");
         setShowDetails(!showDetails);
         console.log("From Desktop");
      }
   }
   console.log("This is the result", showDetails);

   // function to send message
   const handleSend = async () => {
      if (!currentUser || !chatRoomId || !YourMsg.trim()) {
         console.log('Missing data:', {
            userId: currentUser?.uid, roomId: chatRoomId, message: YourMsg
         });
         return;
      }

      try {
         await sendMessage(chatRoomId, currentUser.uid, YourMsg)
         setYourMsg("")
         console.log("Your Message", YourMsg);
      }
      catch (error: any) {
         console.error("Error sanding message:", error);
         setError(error.message)
      }
   }

   // sends message when enter key is pressed
   const EnterIsSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
         handleSend()
      }
   }

   // scrolling to the bottom for new message
   const messageEndRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
   }, [messages])

   return (
      <div className={`bg-zinc-950 text-white h-screen w-full sm:w-1/2 lg:w-[65%] flex flex-col`}>
         {/* Error Message */}
         {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 p-3 mx-4 mt-4 rounded-xl text-sm shadow-sm'>
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Error occurred while getting the messages</span>
               </div>
            </div>
         )}

         {/* Header */}
         <div className='bg-zinc-900 p-3 sm:p-4 flex items-center justify-between'>
            <div className='flex items-center flex-1 min-w-0'>
               {/* Back button for mobile */}

               <button className='p-2 hover:bg-gray-700 rounded-full' onClick={handleUserClick}>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                     <path fillRule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
               </button>
               <div className='relative flex-shrink-0'>
                  <img
                     className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover`}
                     src={userData.profileImg || '/profile-icon.png'}
                     alt={`${userData.displayName}'s profile`}
                  />
                  {/* Online status indicator */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${userData.online ? 'bg-green-500' : 'bg-gray-600'} border-2 border-gray-800 rounded-full`}></div>
               </div>
               <div className='ml-3 sm:ml-4 flex-1 min-w-0' onClick={handleDetailsClick}>
                  <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold truncate'>{userData.displayName || "Anonymous"}</h1>
                  <p className='text-xs sm:text-sm text-zinc-400'>{userStatus.lastSeen}</p>
               </div>
            </div>
            <div className='relative flex items-center gap-2 sm:gap-4'>
               <button className='p-2 hover:bg-gray-700 rounded-full transition-colors duration-200' onClick={() => setShowSearch(!showSearch)}>
                  <img className='w-5 h-5 sm:w-6 sm:h-6' src="/search.png" alt="Search" />
               </button>

               <div className={`justify-between items-center right-14 absolute flex-1 bg-zinc-950 rounded-2xl px-4 py-2 w-[260px] lg:w-[550px] transition-transform ${showSearch ? 'flex scale-100 opacity-100' : 'hidden scale-90 opacity-0'}`}>
                  <input
                     value={searchTerm}
                     onChange={(e) => handleSearch(e.target.value)}
                     className='w-full outline-none bg-transparent text-white placeholder-gray-400 text-sm sm:text-base py-2'
                     type="text"
                     placeholder="Search for a message!"
                  />
                  <div className='text-gray-400'>{currentMatchIndex}/{filteredMsg.length}</div>
                  <div className='m-2'>
                     <img src="/up-down.png" alt="" className='w-3' onClick={goToPrevMatch} />
                     <img src="/up-down.png" alt="" className='w-3 rotate-180' onClick={goToNextMatch} />
                  </div>
               </div>
            </div>
         </div>

         {/* Messages Container */}
         <div className='flex-1 overflow-y-auto hide-scrollbar p-2 sm:p-4'>
            {messages.length === 0 ? (
               // Empty state - centered in the middle of the screen
               <div className='h-full flex items-center justify-center'>
                  <div className='flex flex-col items-center justify-center text-center px-4 max-w-md'>
                     <div className='relative mb-6'>
                        {/* Icon */}
                        <div className='relative bg-zinc-800/50 p-6 sm:p-8 rounded-full'>
                           <svg className='w-12 h-12 sm:w-16 sm:h-16 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z' clipRule='evenodd' />
                           </svg>
                        </div>
                     </div>

                     <h3 className='text-xl sm:text-2xl font-semibold mb-3 text-white'>No messages yet</h3>
                     <p className='text-sm sm:text-base text-gray-400 mb-6 leading-relaxed'>
                        Start the conversation by sending a message below
                     </p>
                  </div>
               </div>
            ) : (
               <div className='flex flex-col gap-1 sm:gap-2 min-h-full justify-end'>
                  {Object.entries(groupedMsg).map(([date, msgs]) => (
                     <div key={date} className="flex flex-col gap-1 sm:gap-2">
                        {/* Date separator */}
                        <div className="flex justify-center my-4">
                           <span className="bg-zinc-800 text-gray-300 text-xs px-3 py-2 rounded-xl">
                              {date}
                           </span>
                        </div>

                        {/* Messages for this date */}
                        {msgs.map((message, index) => (
                           <div
                              key={message.id}
                              className={`flex flex-col ${message.senderId === currentUser!.uid ? 'items-end' : 'items-start'}`}
                           >
                              <div
                                 className={`max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-2xl text-sm sm:text-base lg:text-xl 
                                   ${message.senderId === currentUser!.uid
                                       ? 'bg-zinc-100 text-zinc-900 rounded-br-md ml-8 sm:ml-16'
                                       : 'bg-zinc-900 text-white rounded-bl-md mr-8 sm:mr-16'
                                    }`}
                                 ref={index === msgs.length - 1 && date === Object.keys(groupedMsg).slice(-1)[0] ? messageEndRef : null}
                              >
                                 <p className='break-words'>{highlightSearch(message.text, searchTerm)}</p>
                              </div>
                              <div className='text-[11px] mt-1 text-zinc-400 flex'>
                                 {message.createdAt?.toDate().toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                 })}
                                 {message.senderId === currentUser?.uid && (message.seenBy.length > 1 && <img src="seen.png" alt="" className='w-3 h-3 mx-2' />)}
                              </div>
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Input Container */}
         <div className='relative bg-zinc-900 p-3 sm:p-4 flex items-center gap-2 sm:gap-3'>
            {/* Emoji Button */}
            <button className='p-2 hover:bg-zinc-800 rounded-full transition-colors duration-200 flex-shrink-0' onClick={() => setShowPicker(prev => !prev)}>
               <img className='w-8 h-8 sm:w-6 sm:h-6' src="/emoji.png" alt="Emoji" />
            </button>
            <div ref={pickerRef} className={`absolute bottom-24 left-2 z-1 transition-transform ${showPicker ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
               {
                  showPicker && (
                     <EmojiPicker
                        onEmojiClick={addEmoji}
                        theme='dark'
                        emojiStyle='apple'
                        height={400}
                        width={350}
                     />
                  )
               }
            </div>

            {/* Input Field */}
            <div className='flex-1 bg-zinc-950 rounded-full px-4 py-2'>
               <input
                  onKeyDown={EnterIsSend}
                  onChange={(e) => setYourMsg(e.target.value)}
                  value={YourMsg}
                  className='w-full outline-none bg-transparent text-white placeholder-zinc-400 text-sm sm:text-base py-2'
                  type="text"
                  placeholder="Type a message!"
               />
            </div>

            {/* Send Button */}
            <button
               onClick={handleSend}
               disabled={!YourMsg.trim()}
               className={`p-3 sm:p-4 rounded-full transition-all duration-200 flex-shrink-0 ${YourMsg.trim()
                  ? 'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-200'
                  : 'bg-zinc-600 cursor-not-allowed'
                  }`}
            >
               <img className='w-5 h-5 sm:w-6 sm:h-6' src="/send.png" alt="Send" />
            </button>
         </div>
      </div>
   )
}

export default ChatSpace