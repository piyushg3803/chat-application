import { useEffect, useState } from 'react'
import ChatList from '../Components/ChatList';
import ChatSpace from '../Components/ChatSpace';
import ChatDetails from '../Components/ChatDetails';
import { Route, Routes, useParams } from 'react-router-dom';
import EmptyChat from '../Components/EmptyChat';
import { useMediaQuery } from 'react-responsive';

interface SelectedUser {
    name: string;
    id: string;
}

function ChatPage() {
    const { chatId } = useParams<{ chatId?: string }>()
    console.log("chatId", chatId);

    const [currentUser, setCurrentuser] = useState<SelectedUser>({
        name: '',
        id: ''
    })
    const [showDetails, setShowDetails] = useState(false)
    const [showChat, setShowChat] = useState(false)

    const isMobile = useMediaQuery({ maxWidth: 641 });

    const handleChange = (userName: string, userId: string) => {
        setCurrentuser({
            name: userName,
            id: userId
        })
    }

    useEffect(() => {
        if (!chatId) {
            setCurrentuser({ name: '', id: '' })
            setShowDetails(false)
        }
    }, [chatId])

    const toggleChatDetails = () => {
        setShowDetails(!showDetails)
    }

    const toggleChat = () => {
        setShowChat(!showChat)
    }

    const closeChatDetails = () => {
        setShowDetails(false)
    }


    return (
        <div className="h-screen flex overflow-hidden">
            {/* Desktop */}
            { !isMobile && <div className="hidden sm:flex w-full relative">
                <ChatList userName={handleChange} handleChat={toggleChat} />

                {/* <div className='flex'> */}
                {showChat ? (<ChatSpace userName={currentUser.name} userId={currentUser.id} handleChatDetails={toggleChatDetails} />) :
                    (<EmptyChat />)}

                {chatId && (<ChatDetails chatId={chatId} toCloseChatDetails={closeChatDetails} className={`${showDetails ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-full`} />)}
                {/* </div> */}
            </div>}

            {/* Mobile */}
            { isMobile && <div className="min-md:hidden w-full">
                <Routes>
                    <Route path='/' element={<ChatList userName={handleChange} chatId={chatId} />} />
                    <Route path='/chatspace' element={<ChatSpace userName={currentUser.name} userId={currentUser.id} />} />
                    <Route path='/:chatId/chatdetails' element={<ChatDetails chatId={chatId} />} />
                </Routes>
            </div>}
        </div>
    )
}

export default ChatPage;