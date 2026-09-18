import { useEffect, useState } from 'react'
import TicketForm from '../components/tickets/TicketForm'
import TicketCard from '../components/tickets/TicketCard'
import api from '../api/axios'
import './EmployeePortal.css'

function EmployeePortal() {
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)

      const [userResponse, ticketsResponse] = await Promise.all([
        api.get('/auth/me/'),
        api.get('/tickets/my-tickets/'),
      ])

      setUser(userResponse.data)
      setTickets(ticketsResponse.data)
    } catch (err) {
      console.error(err)
      setError('Could not load your employee portal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreated = (ticket) => {
    setTickets((currentTickets) => [ticket, ...currentTickets])
    setShowForm(false)
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'open'
  ).length

  const progressTickets = tickets.filter(
    (ticket) => ticket.status === 'in_progress'
  ).length

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === 'closed'
  ).length

  if (loading) {
    return (
      <div className="employee-page">
        <p>Loading your tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="employee-page">
        <p className="error-text">{error}</p>
      </div>
    )
  }

  return (
    <div className="employee-page">
      <section className="employee-hero">
        <div>
          <p className="employee-label">Employee portal</p>
          <h1>Hello, {user?.username}</h1>
          <p>
            Create support requests and follow the progress of your tickets.
          </p>
        </div>

        <button
          type="button"
          className="employee-create-button"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? 'Cancel' : '+ Create Ticket'}
        </button>
      </section>

      <section className="employee-stats">
        <article className="employee-stat total">
          <span>My Tickets</span>
          <strong>{tickets.length}</strong>
        </article>

        <article className="employee-stat open">
          <span>Open</span>
          <strong>{openTickets}</strong>
        </article>

        <article className="employee-stat progress">
          <span>In Progress</span>
          <strong>{progressTickets}</strong>
        </article>

        <article className="employee-stat closed">
          <span>Closed</span>
          <strong>{closedTickets}</strong>
        </article>
      </section>

      {showForm && (
        <section className="employee-form-panel">
          <div className="employee-form-title">
            <h2>Create a support ticket</h2>
            <p>
              Your username will be attached automatically to this request.
            </p>
          </div>

          <TicketForm onCreated={handleCreated} />
        </section>
      )}

      <section className="employee-ticket-section">
        <div className="employee-section-heading">
          <div>
            <h2>My Support Tickets</h2>
            <p>Only tickets created from your account appear here.</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="employee-empty">
            <span>🎧</span>
            <h3>No tickets yet</h3>
            <p>Create your first support request when you need IT help.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default EmployeePortal