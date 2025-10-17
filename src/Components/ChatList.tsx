import { useEffect, useState } from 'react'
import { logOut } from '../backend/authUtil'
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../Context/authContext';
import { db } from '../backend/firebaseAuth';
import { useMediaQuery } from 'react-responsive';
import { format, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
   id: string;
   uid?: string;
   displayName?: string;
   profileImg: string;
   about?: string;
   location: string;
   email?: string;
   lastSeen?: unknown;
   online?: boolean;
   createdAt?: string;
   lastMessage?: {
      text: string;
      senderId: string;
      timestamp: any;
   };
}

interface Message {
   id: string;
   text: string;
   senderId: string;
   createdAt: any;
}

interface ChatListProps {
   userName: Function;
   setShowChat: (show: boolean) => void;
}

function ChatList({ userName, setShowChat }: ChatListProps) {
   const [singleUser, setSingleUser] = useState<User | null>(null);
   const [users, setUsers] = useState<User[] | null>(null);
   const [showSearch, setShowSearch] = useState(false)
   const [searchTerm, setSearchTerm] = useState<string>('')
   const [searchedUser, setSearchedUsers] = useState<User[]>([])
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const navigate = useNavigate();
   const { user: currentUser } = useAuth();
   const isMobile = useMediaQuery({ maxWidth: 641 });

   const handleUserClick = (user: User) => {
      userName(user);
      if (isMobile) {
         setShowChat(true)
         navigate('chatspace');
      }
      else setShowChat(true);
   };

   useEffect(() => {
      const fetchUsers = async () => {
         setLoading(true);
         if (!currentUser?.uid) {
            setLoading(false);
            return;
         }

         try {
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            const userList: User[] = [];

            for (const doc of querySnapshot.docs) {
               if (doc.id === currentUser.uid) continue;
               const userData = doc.data() as Omit<User, "id">;
               const chatRoomId = [currentUser.uid, doc.id].sort().join('_');
               const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
               const lastMessageQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(1));

               try {
                  const messageSnapshot = await getDocs(lastMessageQuery);
                  let lastMessage;
                  if (!messageSnapshot.empty) {
                     const messageDoc = messageSnapshot.docs[0];
                     const messageData = messageDoc.data() as Message;
                     lastMessage = {
                        text: messageData.text,
                        senderId: messageData.senderId,
                        timestamp: messageData.createdAt
                     };
                  }
                  userList.push({ id: doc.id, ...userData, lastMessage });
               } catch {
                  userList.push({ id: doc.id, ...userData });
               }
            }

            setUsers(userList);
            const singleUserData = querySnapshot.docs.find(doc => doc.id === currentUser.uid);
            if (singleUserData) {
               setSingleUser({
                  id: singleUserData.id,
                  ...singleUserData.data() as Omit<User, "id">
               });
            }
         } catch (error: any) {
            console.error("Error Fetching Users:", error);
            setError(true);
         } finally {
            setLoading(false);
         }
      };
      fetchUsers();
   }, [currentUser?.uid]);

   const handleSearch = async (term: string) => {
      setSearchTerm(term);

      if (!term.trim()) {
         setSearchedUsers([]);
         return;
      }

      if (users) {
         const searchedUser = users?.filter(m =>
            m.displayName?.toLowerCase().includes(term.toLowerCase())
         );
         setSearchedUsers(searchedUser)
      }
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

   const sortedUsers = users ? [...users].sort((a: User, b: User) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;

      return b.lastMessage.timestamp.toDate().getTime() - a.lastMessage.timestamp.toDate().getTime()
   }) : []

   const handlelogout = async () => {
      try {
         await logOut();
         alert('Logged Out Successfully');
         navigate('/');
      } catch (error) {
         setError(true);
         console.log(error);
      }
   };

   return (
      <div className="relative bg-zinc-950 border-r-2 border-zinc-800 text-white h-screen w-full sm:w-1/2 lg:w-[35%] flex flex-col">
         {/* Header */}
         <div className="p-5 flex items-center justify-between backdrop-blur-md bg-zinc-900/60">
            <div className="flex items-center">
               <img className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" src="chat.png" alt="Chat" />
               <h1 className="text-xl sm:text-2xl ps-3 font-semibold tracking-wide">Chats</h1>
            </div>
            <img onClick={() => setShowSearch(!showSearch)} className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:scale-110 transition-transform" src="search.png" alt="Search" />
            {showSearch &&
               <div className={`justify-between items-center right-14 absolute flex-1 bg-zinc-950 rounded-2xl px-4 py-2 w-[310px] lg:w-[285px] transition-transform ${showSearch ? 'flex scale-100 opacity-100' : 'hidden scale-90 opacity-0'}`}>
                  <input
                     value={searchTerm}
                     onChange={(e) => handleSearch(e.target.value)}
                     className='w-full outline-none bg-transparent text-white placeholder-gray-400 text-sm sm:text-base py-2'
                     type="text"
                     placeholder="Search for a message!"
                  />
                  <div className='text-gray-400'>{searchedUser.length}</div>
               </div>
            }
         </div>
         {/* Chat List */}
         <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-1">
            {loading ? (
               <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                     <p className="text-gray-400">Loading Chats...</p>
                  </div>
               </div>
            ) : error ? (
               <div className="text-red-400 bg-red-900/20 p-4 rounded-lg text-center mx-3 border border-red-700">
                  Failed to load chats.
               </div>
            ) : (
               <AnimatePresence>
                  {(searchTerm ? searchedUser : sortedUsers).map((user) => (
                     (<motion.div
                        key={user.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={() => handleUserClick(user)}
                        className="flex items-center justify-between mx-2 p-3 rounded-xl hover:bg-zinc-800/40 transition-all cursor-pointer backdrop-blur-sm"
                     >
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="relative">
                              <img
                                 className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 hover:border-zinc-300 transition-all"
                                 src={user.profileImg || "profile-icon.png"}
                                 alt=""
                              />
                              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${user.online ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                           </div>
                           <div className="min-w-0 flex-1">
                              <h2 className="font-medium truncate">{highlightSearch(user.displayName || "Anonymous", searchTerm)}</h2>
                              <p className="text-gray-400 text-sm truncate">
                                 {user.lastMessage?.senderId === singleUser?.id && 'You: '}
                                 {user.lastMessage?.text || "Start a Conversation"}
                              </p>
                           </div>
                        </div>
                        {user.lastMessage && (
                           <p className="text-xs text-gray-500 whitespace-nowrap">
                              {isToday(user.lastMessage.timestamp.toDate())
                                 ? format(user.lastMessage.timestamp.toDate(), "HH:mm")
                                 : format(user.lastMessage.timestamp.toDate(), "dd/MM")}
                           </p>
                        )}
                     </motion.div>)
                  ))}
               </AnimatePresence>
            )}
         </div>

         {/* Bottom Profile Section */}
         <div className=" bg-zinc-900/70 backdrop-blur-md p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
               <img
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  src={singleUser?.profileImg || "profile-icon.png"}
                  alt="profile"
               />
               <p className="text-sm font-semibold truncate">{singleUser?.displayName || "You"}</p>
            </div>

            <div className="relative">
               <button
                  onClick={handlelogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-200 bg-zinc-800 hover:bg-zinc-700 flex items-center rounded-lg transition-all border-gray-700"
               >
                  <img src="/logout.png" className="w-6 h-6 mr-2" alt="logout" />
                  Logout
               </button>
            </div>
         </div>
      </div >
   );
}

export default ChatList;
