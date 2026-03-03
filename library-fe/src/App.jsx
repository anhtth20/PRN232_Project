import React, { useState, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookList from './pages/BookList'
import BookDetails from './pages/BookDetails'
import MyBorrowed from './pages/MyBorrowed'
import MainLayout from './components/MainLayout'

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        return jwtDecode(token)
      } catch (error) {
        console.error('Initial token decoding failed:', error)
        localStorage.removeItem('token')
        return null
      }
    }
    return null
  })

  const [selectedBookId, setSelectedBookId] = useState(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const savedScrollY = useRef(0)

  const handleLoginSuccess = (token) => {
    try {
      const decoded = jwtDecode(token)
      setUser(decoded)
      navigate('/books')
    } catch (error) {
      console.error('Token decoding failed:', error)
      localStorage.removeItem('token')
      setUser(null)
      navigate('/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
    setSelectedBookId(null)
  }

  const handleBookClick = (id) => {
    savedScrollY.current = window.scrollY
    setSelectedBookId(id)
    navigate(`/books/${id}`)
  }

  const handleBackToList = useCallback(() => {
    navigate('/books')
    // Restore scroll after React re-renders the list
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' })
    })
  }, [navigate])

  const handleGlobalSearch = (value) => {
    setGlobalSearch(value)
    if (location.pathname !== '/books') {
      navigate('/books')
    }
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/books" /> : 
        <Login onLoginSuccess={handleLoginSuccess} />
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/books" /> : 
        <Signup />
      } />
      
      <Route path="/books" element={
        user ? (
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <BookList 
              user={user} 
              onBookClick={handleBookClick}
              externalSearch={globalSearch}
            />
          </MainLayout>
        ) : <Navigate to="/login" />
      } />

      <Route path="/books/:id" element={
        user ? (
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <BookDetails 
              bookId={selectedBookId} 
              onBack={handleBackToList}
              user={user} 
            />
          </MainLayout>
        ) : <Navigate to="/login" />
      } />

      <Route path="/my-borrowed" element={
        user ? (
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <MyBorrowed />
          </MainLayout>
        ) : <Navigate to="/login" />
      } />

      <Route path="/" element={<Navigate to={user ? "/books" : "/login"} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
