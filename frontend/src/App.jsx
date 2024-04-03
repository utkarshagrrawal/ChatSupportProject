import ChatPage from '../components/Admin/Chats/ChatPage'
import Login from '../components/Admin/Login'
import LandingPage from '../components/User/Landing/LandingPage'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/admin/signin' element={<Login />} />
        <Route path='/admin/chats' element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App
