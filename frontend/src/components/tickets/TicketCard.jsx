import { Link } from 'react-router-dom'

function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="ticket-card-link"
      aria-label={`Open ticket ${ticket.title}`}
    >
      <article className="ticket-card">
        <div className="ticket-card-top">
          <span className="ticket-number">
            #{ticket.id}
          </span>

          <span className={`status ${ticket.status}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <h3>{ticket.title}</h3>

        <p className="ticket-description">
          {ticket.description}
        </p>

        <div className="ticket-card-footer">
          <span>
            {ticket.priority || 'medium'} priority
          </span>

          {ticket.image && (
            <span className="attachment-label">
              📎 Attachment
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}

export default TicketCard