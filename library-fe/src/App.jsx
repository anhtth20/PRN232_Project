import React, { useState, useRef, useCallback } from 'react'
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
  const savedScrollY = useRef(0)

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
    savedScrollY.current = window.scrollY
    setSelectedBookId(id)
    setView('bookdetails')
  }

  const handleBackToList = useCallback(() => {
    setView('booklist')
    // Restore scroll after React re-renders the list
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' })
    })
  }, [])

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
          {/* Always keep BookList mounted to preserve state; show/hide with CSS */}
          <div style={{ display: view === 'booklist' ? 'block' : 'none' }}>
            <BookList 
              user={user} 
              onBookClick={handleBookClick}
              externalSearch={globalSearch}
            />
          </div>
          {view === 'bookdetails' && (
            <BookDetails 
              bookId={selectedBookId} 
              onBack={handleBackToList}
              user={user} 
            />
          )}
        </MainLayout>
      )}
    </>
  )
}

export default App
