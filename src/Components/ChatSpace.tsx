import React, { useEffect, useRef, useState } from 'react';
import { createOrGetChatRoom, listenMessages, sendMessage } from '../backend/chatUtil';
import { useAuth } from '../Context/authContext';

interface ChatSpaceProps {
    userName: string;
    userId: string;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
}


function ChatSpace({ userName, userId }: ChatSpaceProps) {
    const { user: currentUser } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [YourMsg, setYourMsg] = useState('')
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null)

    // creating or retrieving the chatRoom
    useEffect(() => {
        const initializeChat = async () => {
            if (!userId || !currentUser?.uid) return;

            try {
                const chatRoom = await createOrGetChatRoom(currentUser.uid, userId);
                console.log("Chat Room Created/Retreived", chatRoom);
                setChatRoomId(chatRoom.id)
            }
            catch (error) {
                console.error("Error initializing chat:", error);
                setError("Failed to initialize chat!")
            }
        }

        if (userName && userId) {
            initializeChat();
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
        <div className='bg-gray-950 text-white h-screen w-[50%] flex flex-col'>

            {error && <div>Error occured while getting the messages </div>}

            <div className='bg-gray-800 p-4 flex items-center justify-between'>
                <div className='flex'>
                    <img className='w-12 rounded-full brightness-50' src="profile-icon.png" alt="" />
                    <div>
                        <h1 className='text-2xl ps-4 '>{userName}</h1>
                        <p className='text-sm ps-4 text-zinc-400'>State</p>
                    </div>
                </div>
                <div className='m-4'>
                    <img src="search.png" alt="" />
                </div>
            </div>

            <div className='flex-1 overflow-y-auto hide-scrollbar p-2'>
                <div className='flex flex-col gap-2 min-h-full justify-end'>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUser!.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] p-3 rounded-2xl text-lg ${message.senderId === currentUser!.uid
                                ? 'bg-gray-800 text-white rounded-br-md'
                                : 'bg-gray-900 text-white rounded-bl-md'
                                }`} ref={messageEndRef}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='bg-gray-800 p-4 flex items-center'>
                <div className='m-2'>
                    <img src="emoji.png" alt="" />
                </div>
                <div className='ms-3'>
                    <img src="attach.png" alt="" />
                </div>
                <div className='mx-4 bg-gray-950 p-2 w-[80%] rounded-full'>
                    <input onKeyDown={EnterIsSend} onChange={(e) => setYourMsg(e.target.value)} value={YourMsg} className='w-full outline-none p-3 rounded-full bg-gray-950 text-white' type="text" placeholder="Type a message!" />
                </div>
                <div>
                    <button onClick={handleSend} className='bg-gray-200 text-black p-5 px-6 rounded-full'><img src="/send.png" alt="" /></button>
                </div>
            </div>
        </div>
    )
}

export default ChatSpace