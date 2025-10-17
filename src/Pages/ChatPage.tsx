import { useEffect, useState } from 'react'
import ChatSpace from '../Components/ChatSpace';
import ChatDetails from '../Components/ChatDetails';
import { Route, Routes, useNavigate } from 'react-router-dom';
import EmptyChat from '../Components/EmptyChat';
import { useMediaQuery } from 'react-responsive';
import ChatList from '../Components/ChatList';

interface User {
   displayName: string, id: string, profileImg: string, email: string, online: string, createdAt: string, lastSeen: string, about: string, location: string,
}

function ChatPage() {
   const [currentUser, setCurrentuser] = useState<User>({
      displayName: '',
      id: '',
      profileImg: '',
      email: '',
      online: '',
      lastSeen: '',
      about: '',
      location: '',
      createdAt: ''
   })
   const [showDetails, setShowDetails] = useState(false)
   const [showChat, setShowChat] = useState(false)

   const isMobile = useMediaQuery({ maxWidth: 641 });
   const navigate = useNavigate()

   const handleChange = (user: User) => {
      setCurrentuser(user)
   }

   useEffect(() => {
      if (isMobile) {
         if (window.location.pathname === '/chats') {
            return;
         }

         if(!showChat) {
            navigate('/chats')
         }

         // Handle chat details navigation
         if (showDetails) {
            navigate('/chats/chatspace/chatdetails', {
               replace: true,
               state: { fromChatSpace: true } // Add state to track navigation source
            });
         }
      } else {
         // Desktop: always stay on main route
         navigate('/chats', { replace: true });
      }
   }, [isMobile, showDetails, navigate]);

   return (
      <div className="h-screen flex overflow-hidden relative">
         {/* Desktop */}
         {!isMobile ? (
            <div className="hidden sm:flex w-full relative">
               <ChatList userName={handleChange} setShowChat={setShowChat} />
               {showChat ? (<ChatSpace userData={currentUser} showDetails={showDetails} setShowDetails={setShowDetails} setShowChat={setShowChat} />) :
                  (<EmptyChat />)}
               <ChatDetails setShowDetails={setShowDetails} showDetails={showDetails} userData={currentUser} />
            </div>
         ) : (
            <div className="min-md:hidden w-full">
               <Routes>
                  <Route index element={
                     <ChatList userName={handleChange} setShowChat={setShowChat} />
                  } />
                  <Route path='chatspace/*' element={
                     <ChatSpace
                        userData={currentUser}
                        showDetails={showDetails}
                        setShowDetails={setShowDetails}
                        setShowChat={setShowChat}
                     />
                  } />
                  <Route path='chatspace/chatdetails' element={
                     <ChatDetails
                        userData={currentUser}
                        showDetails={true}
                        setShowDetails={setShowDetails}
                     />
                  } />
               </Routes>
            </div>
         )}
      </div>
   )
}

export default ChatPage;