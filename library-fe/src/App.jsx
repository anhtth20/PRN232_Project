import React, { useState, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookList from './pages/BookList'
import BookDetails from './pages/BookDetails'
import MyBorrowed from './pages/MyBorrowed'
import MyFines from './pages/MyFines'
import ProfileEdit from './pages/ProfileEdit'
import MainLayout from './components/MainLayout'
import LibrarianLayout from './components/LibrarianLayout'
import LibrarianDashboard from './pages/librarian/LibrarianDashboard'
import LibrarianAuthors from './pages/librarian/LibrarianAuthors'
import LibrarianBooks from './pages/librarian/LibrarianBooks'
import LibrarianBorrowers from './pages/librarian/LibrarianBorrowers'
import LibrarianFines from './pages/librarian/LibrarianFines'

const RoleRoute = ({ children, allowedRole, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user.role?.toLowerCase() || '';
  if (userRole !== allowedRole.toLowerCase()) {
    // Redirect based on their actual role
    if (userRole === 'librarian') {
      return <Navigate to="/librarian" replace />;
    } else {
      return <Navigate to="/books" replace />;
    }
  }

  return children;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        decoded.role = decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        return decoded
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
      decoded.role = decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      
      setUser(decoded)
      
      const roleStr = decoded.role?.toLowerCase() || '';
      if (roleStr === 'librarian') {
        navigate('/librarian')
      } else {
        navigate('/books')
      }
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

  const isLibrarian = user && ['librarian'].includes(user.role?.toLowerCase());

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={isLibrarian ? "/librarian" : "/books"} /> : 
        <Login onLoginSuccess={handleLoginSuccess} />
      } />
      <Route path="/signup" element={
        user ? <Navigate to={isLibrarian ? "/librarian" : "/books"} /> : 
        <Signup />
      } />
      
      {/* Borrower Routes */}
      <Route path="/books" element={
        <RoleRoute user={user} allowedRole="borrower">
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <BookList user={user} onBookClick={handleBookClick} externalSearch={globalSearch} />
          </MainLayout>
        </RoleRoute>
      } />

      <Route path="/books/:id" element={
        <RoleRoute user={user} allowedRole="borrower">
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <BookDetails bookId={selectedBookId} onBack={handleBackToList} user={user} />
          </MainLayout>
        </RoleRoute>
      } />

      <Route path="/my-borrowed" element={
        <RoleRoute user={user} allowedRole="borrower">
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <MyBorrowed />
          </MainLayout>
        </RoleRoute>
      } />

      <Route path="/my-fines" element={
        <RoleRoute user={user} allowedRole="borrower">
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <MyFines />
          </MainLayout>
        </RoleRoute>
      } />
      
      <Route path="/profile" element={
        <RoleRoute user={user} allowedRole="borrower">
          <MainLayout user={user} onLogout={handleLogout} onSearch={handleGlobalSearch}>
            <ProfileEdit />
          </MainLayout>
        </RoleRoute>
      } />

      {/* Librarian Routes */}
      <Route path="/librarian" element={
        <RoleRoute user={user} allowedRole="librarian">
          <LibrarianLayout user={user}>
            <LibrarianDashboard />
          </LibrarianLayout>
        </RoleRoute>
      } />
      
      <Route path="/librarian/books" element={
        <RoleRoute user={user} allowedRole="librarian">
          <LibrarianLayout user={user}>
            <LibrarianBooks />
          </LibrarianLayout>
        </RoleRoute>
      } />

      <Route path="/librarian/authors" element={
        <RoleRoute user={user} allowedRole="librarian">
          <LibrarianLayout user={user}>
            <LibrarianAuthors />
          </LibrarianLayout>
        </RoleRoute>
      } />

      <Route path="/librarian/borrowers" element={
        <RoleRoute user={user} allowedRole="librarian">
          <LibrarianLayout user={user}>
            <LibrarianBorrowers />
          </LibrarianLayout>
        </RoleRoute>
      } />

      <Route path="/librarian/fines" element={
        <RoleRoute user={user} allowedRole="librarian">
          <LibrarianLayout user={user}>
            <LibrarianFines />
          </LibrarianLayout>
        </RoleRoute>
      } />

      <Route path="/" element={<Navigate to={user ? (isLibrarian ? "/librarian" : "/books") : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? (isLibrarian ? "/librarian" : "/books") : "/login"} replace />} />
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
