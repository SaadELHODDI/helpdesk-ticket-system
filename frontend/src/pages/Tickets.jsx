import { useState } from 'react'
import TicketList from '../components/tickets/TicketList'
import TicketForm from '../components/tickets/TicketForm'
import './Tickets.css'

function Tickets() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const handleCreated = () => {
    setRefreshKey(k => k + 1)
    setShowForm(false)
  }

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <div>
          <h1>Tickets</h1>
          <p className="tickets-subtitle">Manage and track support requests</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="tickets-form-panel">
          <TicketForm onCreated={handleCreated} />
        </div>
      )}

      <TicketList key={refreshKey} />
    </div>
  )
}

export default Tickets
