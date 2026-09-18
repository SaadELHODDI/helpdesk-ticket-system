import { useState } from 'react'
import api from '../../api/axios'

function TicketForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('status', 'open')
    formData.append('priority', priority)

    if (image) {
      formData.append('image', image)
    }

    try {
      const response = await api.post('/tickets/', formData)

      setTitle('')
      setDescription('')
      setPriority('medium')
      setImage(null)
      onCreated(response.data)
    } catch (err) {
      console.error('Ticket creation error:', err.response?.data || err.message)
      setError('Could not create the ticket. Check that you are logged in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      {error && <p className="error-text">{error}</p>}

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Ticket title"
        required
      />

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe the problem"
        required
      />

      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
        <option value="urgent">Urgent priority</option>
      </select>

      <label className="file-label">
        Screenshot or issue photo (optional)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setImage(event.target.files[0] || null)}
        />
      </label>

      {image && (
        <p className="selected-file">
          Selected: {image.name}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  )
}

export default TicketForm