import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import './TicketDetail.css'

const DJANGO_URL = 'http://127.0.0.1:8000'

function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  useEffect(() => {
    api.get(`/tickets/${id}/`)
      .then((response) => {
        setTicket(response.data)
        setResolutionNotes(response.data.resolution_notes || '')
      })
      .catch((error) => {
        console.error(
          'Ticket detail error:',
          error.response?.data || error.message
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status) => {
    setSaving(true)

    try {
      const response = await api.patch(`/tickets/${id}/`, {
        status,
        resolution_notes: resolutionNotes,
      })

      setTicket(response.data)
    } catch (error) {
      console.error(
        'Ticket update error:',
        error.response?.data || error.message
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket permanently?')) return

    try {
      await api.delete(`/tickets/${id}/`)
      navigate('/tickets')
    } catch (error) {
      console.error(
        'Ticket deletion error:',
        error.response?.data || error.message
      )
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <p>Loading ticket...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="detail-page">
        <p>Ticket not found.</p>
      </div>
    )
  }

  const imageUrl = ticket.image
    ? ticket.image.startsWith('http')
      ? ticket.image
      : `${DJANGO_URL}${ticket.image}`
    : null

  return (
    <div className="detail-page">
      <button
        className="back-link"
        onClick={() => navigate('/tickets')}
      >
        ← Back to tickets
      </button>

      <article className="detail-card">
        <div className="detail-header">
          <div>
            <p className="ticket-id">Ticket #{ticket.id}</p>
            <h1>{ticket.title}</h1>
          </div>

          <span className={`status ${ticket.status}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <div className="detail-info-grid">
          <div>
            <span className="info-label">Priority</span>
            <span className={`priority priority-${ticket.priority}`}>
              {ticket.priority}
            </span>
          </div>

          <div>
            <span className="info-label">Created by</span>
            <span>{ticket.created_by_username || 'Unknown'}</span>
          </div>

          <div>
            <span className="info-label">Assigned to</span>
            <span>{ticket.assigned_to_username || 'Not assigned'}</span>
          </div>

          <div>
            <span className="info-label">Created at</span>
            <span>
              {new Date(ticket.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <section className="detail-section">
          <h2>Problem description</h2>
          <p className="detail-description">{ticket.description}</p>
        </section>

        {imageUrl && (
          <section className="detail-section">
            <h2>Attached screenshot / photo</h2>

            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="ticket-image-link"
            >
              <img
                src={imageUrl}
                alt={`Attachment for ticket ${ticket.id}`}
                className="ticket-image"
              />
            </a>
          </section>
        )}

        {ticket.status === 'closed' && (
          <section className="resolution-box">
            <h2>Resolution</h2>

            <p>
              <strong>Resolved by:</strong>{' '}
              {ticket.resolved_by_username || 'Unknown IT agent'}
            </p>

            <p>
              <strong>Resolved at:</strong>{' '}
              {ticket.resolved_at
                ? new Date(ticket.resolved_at).toLocaleString()
                : 'Not recorded'}
            </p>

            <p className="resolution-text">
              {ticket.resolution_notes || 'No resolution notes were added.'}
            </p>
          </section>
        )}

        {ticket.status !== 'closed' && (
          <section className="detail-section resolution-form">
            <h2>Resolution notes</h2>

            <textarea
              value={resolutionNotes}
              onChange={(event) => setResolutionNotes(event.target.value)}
              placeholder="Explain what you did to solve this issue..."
            />

            <p className="resolution-help">
              When you close the ticket, your logged-in IT username is
              automatically saved as the resolver.
            </p>
          </section>
        )}

        <div className="detail-actions">
          <span className="actions-label">Change status:</span>

          <button
            disabled={saving || ticket.status === 'open'}
            onClick={() => updateStatus('open')}
          >
            Open
          </button>

          <button
            disabled={saving || ticket.status === 'in_progress'}
            onClick={() => updateStatus('in_progress')}
          >
            In Progress
          </button>

          <button
            className="close-ticket-btn"
            disabled={saving || ticket.status === 'closed'}
            onClick={() => updateStatus('closed')}
          >
            {saving ? 'Saving...' : 'Close Ticket'}
          </button>
        </div>

        <button className="btn-delete" onClick={handleDelete}>
          Delete Ticket
        </button>
      </article>
    </div>
  )
}

export default TicketDetail