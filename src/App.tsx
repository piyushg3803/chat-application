import 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import ChatPage from './Pages/ChatPage'
import UserProfile from './Pages/UserProfile'
import ProtectedRoute from './Components/ProtectedRoute'

function App() {

  if (import.meta.env.MODE === "production") {
    console.log = () => { };
    console.error = () => { };
    console.info = () => { };
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path='/chats/*' element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
