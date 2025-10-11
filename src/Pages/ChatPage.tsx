import { useEffect, useState } from 'react'
import ChatSpace from '../Components/ChatSpace';
import ChatDetails from '../Components/ChatDetails';
import { Route, Routes, useNavigate } from 'react-router-dom';
import EmptyChat from '../Components/EmptyChat';
import { useMediaQuery } from 'react-responsive';
import ChatList from '../Components/ChatList';

interface User {
    id: string;
    name: string;
    email?: string;
    lastSeen?: string;
    createdAt?: string;
}

function ChatPage() {
    const [currentUser, setCurrentuser] = useState<User>({
        name: '',
        id: '',
        email: '',
        lastSeen: '',
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
        if (window.location.pathname !== '/chats') {
            navigate('/chats', { replace: true })
        }
    }, [])

    useEffect(() => {
        const isChatOpen = location.pathname.includes('/chatspace')

        if (!isMobile) {
            navigate('/chats')

            if (isChatOpen) {
                setShowChat(true)
            }
        }
        else if (showChat && !isChatOpen) {
            navigate('/chats/chatspace')
        }
    }, [isMobile, navigate, showChat])

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Desktop */}
            {!isMobile && <div className="hidden sm:flex w-full relative">
                <ChatList userName={handleChange} setShowChat={setShowChat} setShowDetails={setShowDetails} showDetails={showDetails} />
                {showChat ? (<ChatSpace userData={currentUser} showDetails={showDetails} setShowDetails={setShowDetails} setShowChat={setShowChat} />) :
                    (<EmptyChat />)}
                <ChatDetails setShowDetails={setShowDetails} showDetails={showDetails} userData={currentUser} />
            </div>}

            {/* Mobile */}
            {isMobile && <div className="min-md:hidden w-full">
                <Routes>
                    <Route path='/' element={<ChatList userName={handleChange} setShowChat={setShowChat} setShowDetails={setShowDetails} showDetails={showDetails} />} />
                    <Route path='/chatspace' element={<ChatSpace userData={currentUser} setShowDetails={setShowDetails} setShowChat={setShowChat} />} />
                    <Route path='/chatspace/chatdetails' element={<ChatDetails userData={currentUser} setShowDetails={setShowDetails} showDetails={showDetails} />} />
                </Routes>
            </div>}
        </div>
    )
}

export default ChatPage;