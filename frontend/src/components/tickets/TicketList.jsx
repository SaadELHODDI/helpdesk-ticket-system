import { useEffect, useState } from 'react'
import api from '../../api/axios'
import TicketCard from './TicketCard'

function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/tickets/')
      .then(res => setTickets(res.data))
      .catch(err => {
        console.error(err)
        setError('Failed to load tickets.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading tickets...</p>
  if (error) return <p className="error-text">{error}</p>
  if (tickets.length === 0) return <p>No tickets yet. Create your first one above.</p>

  return (
    <div className="ticket-list">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

export default TicketList
