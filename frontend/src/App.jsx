import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import Login from './pages/Login'
import EmployeePortal from './pages/EmployeePortal'
import './App.css'

function isAuthenticated() {
  return Boolean(localStorage.getItem('access_token'))
}

function PrivateRoute({ children }) {
  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-main">
        {children}
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <PrivateRoute>
              <AppLayout>
                <Tickets />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <TicketDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />
<Route
  path="/employee"
  element={
    <PrivateRoute>
      <AppLayout>
        <EmployeePortal />
      </AppLayout>
    </PrivateRoute>
  }
/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App