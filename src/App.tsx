import 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import ChatPage from './Pages/ChatPage'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/chats/*' element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App
