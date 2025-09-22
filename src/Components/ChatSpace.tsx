import React, { useEffect, useRef, useState } from 'react';
import { createOrGetChatRoom, listenMessages, sendMessage } from '../backend/chatUtil';
import { useAuth } from '../Context/authContext';
import { useNavigate } from 'react-router-dom';

interface ChatSpaceProps {
    userName: string;
    userId: string;
    handleChatDetails?: () => void;
    toggleChat: () => void;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
}

function ChatSpace({ userName, userId, handleChatDetails, toggleChat }: ChatSpaceProps) {
    const { user: currentUser } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [YourMsg, setYourMsg] = useState('')
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate();

    // const { chatId } = useParams<{ chatId?: string }>()

    // creating or retrieving the chatRoom
    useEffect(() => {
        const initializeChat = async () => {
            if (!userId || !currentUser?.uid) return;

            try {
                const chatRoom = await createOrGetChatRoom(currentUser.uid, userId);
                console.log("Chat Room Created/Retreived", chatRoom);
                setChatRoomId(chatRoom.id)
                console.log("Chat Room Id", chatRoom.id);
            }
            catch (error) {
                console.error("Error initializing chat:", error);
                setError("Failed to initialize chat!")
            }
        }

        if (userName && userId) {
            initializeChat();
        } else {
            console.log("Chat Could not be initialized");
        }

    }, [userName, userId, currentUser?.uid])

    // sending and retrieving the messages
    useEffect(() => {
        if (!chatRoomId) return;

        try {
            const unsubscribe = listenMessages(chatRoomId, (newMessage: Message[]) => {
                console.log('Received Message:', newMessage);
                setMessages(newMessage)
            });

            return () => {
                unsubscribe();
            }
        }
        catch (error) {
            console.error("Error listening the messages", error);
            setError('Failed to load messages')
        }

    }, [chatRoomId])

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
        <div className={`bg-gray-950 text-white h-screen w-full sm:w-1/2 lg:w-[50%] flex flex-col`}>
            {/* Error Message */}
            {error && (
                <div className='bg-red-900/20 border border-red-500 text-red-400 p-3 mx-4 mt-4 rounded-lg text-sm'>
                    Error occurred while getting the messages
                </div>
            )}

            {/* Header */}
            <div className='bg-gray-800 p-3 sm:p-4 flex items-center justify-between border-b border-gray-700'>
                <div className='flex items-center flex-1 min-w-0'>
                    {/* Back button for mobile */}
                    <button className='sm:hidden p-2 hover:bg-gray-700 rounded-full' onClick={() => navigate('/chats')}>
                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                    </button>
                    <div className='relative flex-shrink-0'>
                        <img
                            className='w-10 h-10 sm:w-12 sm:h-12 rounded-full brightness-50'
                            src="/profile-icon.png"
                            alt={`${userName}'s profile`}
                        />
                        {/* Online status indicator */}
                        <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full'></div>
                    </div>
                    <div className='ml-3 sm:ml-4 flex-1 min-w-0' onClick={handleChatDetails}>
                        <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold truncate'>{userName}</h1>
                        <p className='text-xs sm:text-sm text-zinc-400'>Online</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 sm:gap-4'>
                    <button className='p-2 hover:bg-gray-700 rounded-full transition-colors duration-200'>
                        <img className='w-5 h-5 sm:w-6 sm:h-6' src="/search.png" alt="Search" />
                    </button>

                    {/* More options for mobile */}
                    <button className='sm:hidden p-2 hover:bg-gray-700 rounded-full'>
                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto hide-scrollbar p-2 sm:p-4'>
                <div className='flex flex-col gap-1 sm:gap-2 min-h-full justify-end'>
                    {messages.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full text-center px-4'>
                            <div className='text-gray-400 mb-4'>
                                <svg className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z' clipRule='evenodd' />
                                </svg>
                            </div>
                            <h3 className='text-lg sm:text-xl font-medium mb-2'>No messages yet</h3>
                            <p className='text-sm sm:text-base text-gray-400'>Send a message to start the conversation</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderId === currentUser!.uid ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-2xl text-sm sm:text-base lg:text-lg transition-all duration-200 ${message.senderId === currentUser!.uid
                                        ? 'bg-blue-600 text-white rounded-br-md ml-8 sm:ml-16'
                                        : 'bg-gray-800 text-white rounded-bl-md mr-8 sm:mr-16'
                                        }`}
                                    ref={index === messages.length - 1 ? messageEndRef : null}
                                >   
                                    <p className='break-words'>{message.text}</p>
                                    <div className={`text-xs mt-1 ${message.senderId === currentUser!.uid
                                        ? 'text-blue-200'
                                        : 'text-gray-400'
                                        }`}>
                                        {new Date(message.createdAt?.toDate()).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Input Container */}
            <div className='bg-gray-800 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-t border-gray-700'>
                {/* Emoji Button */}
                <button className='p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 flex-shrink-0'>
                    <img className='w-5 h-5 sm:w-6 sm:h-6' src="/emoji.png" alt="Emoji" />
                </button>

                {/* Attachment Button */}
                <button className='p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 flex-shrink-0'>
                    <img className='w-5 h-5 sm:w-6 sm:h-6' src="/attach.png" alt="Attach" />
                </button>

                {/* Input Field */}
                <div className='flex-1 bg-gray-950 rounded-full px-4 py-2'>
                    <input
                        onKeyDown={EnterIsSend}
                        onChange={(e) => setYourMsg(e.target.value)}
                        value={YourMsg}
                        className='w-full outline-none bg-transparent text-white placeholder-gray-400 text-sm sm:text-base py-2'
                        type="text"
                        placeholder="Type a message!"
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!YourMsg.trim()}
                    className={`p-3 sm:p-4 rounded-full transition-all duration-200 flex-shrink-0 ${YourMsg.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        : 'bg-gray-600 cursor-not-allowed'
                        }`}
                >
                    <img className='w-5 h-5 sm:w-6 sm:h-6' src="/send.png" alt="Send" />
                </button>
            </div>
        </div>
    )
}

export default ChatSpace