import { useState } from 'react'
import ChatList from '../Components/ChatList'
import ChatSpace from '../Components/ChatSpace'
import ChatDetails from '../Components/ChatDetails'

interface SelectedUser {
  name: string;
  id: string;
}

function ChatPage() {

  const [currentUser, setCurrentuser] = useState<SelectedUser>({
    name: '',
    id: ''
  })

  const handleChange = (userName: string, userId: string) => {
    setCurrentuser({
      name: userName,
      id: userId
    })
  }

  return (
    <div className='flex'>
        <ChatList userName={handleChange}/>
        <ChatSpace userName={currentUser.name} userId={currentUser.id} />
        <ChatDetails />
    </div>
  )
}

export default ChatPage