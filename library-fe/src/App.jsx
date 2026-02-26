import React, { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookList from './pages/BookList'
import BookDetails from './pages/BookDetails'
import MainLayout from './components/MainLayout'

function App() {
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

  const [view, setView] = useState(() => {
    if (user) {
      return 'booklist'
    }
    return 'login'
  })

  const [selectedBookId, setSelectedBookId] = useState(null)
  const [globalSearch, setGlobalSearch] = useState('')

  const handleLoginSuccess = (token) => {
    try {
      const decoded = jwtDecode(token)
      setUser(decoded)
      setView('booklist')
    } catch (error) {
      console.error('Token decoding failed:', error)
      localStorage.removeItem('token')
      setUser(null)
      setView('login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setView('login')
    setSelectedBookId(null)
  }

  const handleBookClick = (id) => {
    setSelectedBookId(id)
    setView('bookdetails')
  }

  const handleGlobalSearch = (value) => {
    setGlobalSearch(value)
    if (view !== 'booklist') {
      setView('booklist')
    }
  }

  return (
    <>
      {view === 'login' && (
        <Login 
          onNavigateToSignup={() => setView('signup')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {view === 'signup' && (
        <Signup onNavigateToLogin={() => setView('login')} />
      )}
      
      {(view === 'booklist' || view === 'bookdetails') && (
        <MainLayout 
          user={user} 
          onLogout={handleLogout} 
          onSearch={handleGlobalSearch}
          currentView={view}
        >
          {view === 'booklist' && (
            <BookList 
              user={user} 
              onBookClick={handleBookClick}
              externalSearch={globalSearch}
            />
          )}
          {view === 'bookdetails' && (
            <BookDetails 
              bookId={selectedBookId} 
              onBack={() => setView('booklist')} 
              user={user} 
            />
          )}
        </MainLayout>
      )}
    </>
  )
}

export default App
