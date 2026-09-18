import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    api.post('/token/', { username, password })
      .then(res => {
        localStorage.setItem('access_token', res.data.access)
        navigate('/')
      })
      .catch(() => setError('Invalid username or password.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Helpdesk Login</h1>
        <p className="login-subtitle">Sign in to manage support tickets</p>

        {error && <div className="login-error">{error}</div>}

        <label>Username</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default Login
