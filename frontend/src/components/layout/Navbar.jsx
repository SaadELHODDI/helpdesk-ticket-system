import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isITStaff, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/login')
  }

  const homePath = isITStaff ? '/dashboard' : '/employee'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link
          to={homePath}
          className="navbar-brand"
          onClick={closeMenu}
        >
          <span className="brand-mark">H</span>

          <span className="brand-text">
            <strong>Helpdesk</strong>
            <small>
              {isITStaff ? 'IT Support Portal' : 'Employee Portal'}
            </small>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'is-open' : ''}`}>
          <nav className="nav-links">
            {isITStaff ? (
              <>
                <Link
                  to="/dashboard"
                  className={
                    location.pathname === '/dashboard'
                      ? 'active'
                      : ''
                  }
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

                <Link
                  to="/tickets"
                  className={
                    location.pathname === '/tickets'
                      ? 'active'
                      : ''
                  }
                  onClick={closeMenu}
                >
                  All Tickets
                </Link>
              </>
            ) : (
              <Link
                to="/employee"
                className={
                  location.pathname === '/employee'
                    ? 'active'
                    : ''
                }
                onClick={closeMenu}
              >
                My Tickets
              </Link>
            )}
          </nav>

          <div className="navbar-user">
            <span className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>

            <span className="username">
              {user?.username || 'Employee'}
            </span>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Log out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar