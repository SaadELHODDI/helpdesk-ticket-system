import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import api from '../api/axios'
import './Dashboard.css'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
)

const statusColors = {
  open: '#ef4444',
  in_progress: '#f59e0b',
  closed: '#10b981',
}

const priorityColors = {
  low: '#38bdf8',
  medium: '#6366f1',
  high: '#f97316',
  urgent: '#dc2626',
}

function EmptyChart({ message = 'No data available yet.' }) {
  return (
    <div className="empty-chart">
      <span>📊</span>
      <p>{message}</p>
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/tickets/dashboard-stats/')
      .then((response) => {
        console.log('Dashboard API response:', response.data)
        setData(response.data)
      })
      .catch((err) => {
        console.error('Dashboard error:', err.response?.data || err.message)
        setError('Could not load dashboard statistics.')
      })
  }, [])

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p className="dashboard-error">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="dashboard-page">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  /*
    These safe arrays fix the error:
    Cannot read properties of undefined (reading 'map')
  */
  const statusDistribution = Array.isArray(data.status_distribution)
    ? data.status_distribution
    : []

  const priorityDistribution = Array.isArray(data.priority_distribution)
    ? data.priority_distribution
    : []

  const technicianDistribution = Array.isArray(data.technician_distribution)
    ? data.technician_distribution
    : []

  const categoryDistribution = Array.isArray(data.category_distribution)
    ? data.category_distribution
    : []

  const dailyTickets = Array.isArray(data.daily_tickets)
    ? data.daily_tickets
    : []

  const statusChart = {
    labels: statusDistribution.map((item) =>
      String(item.status || 'unknown').replace('_', ' ')
    ),
    datasets: [
      {
        data: statusDistribution.map((item) => item.count || 0),
        backgroundColor: statusDistribution.map(
          (item) => statusColors[item.status] || '#94a3b8'
        ),
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  }

  const priorityChart = {
    labels: priorityDistribution.map((item) => item.priority || 'Unknown'),
    datasets: [
      {
        label: 'Tickets',
        data: priorityDistribution.map((item) => item.count || 0),
        backgroundColor: priorityDistribution.map(
          (item) => priorityColors[item.priority] || '#94a3b8'
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const technicianChart = {
    labels: technicianDistribution.map(
      (item) => item.resolved_by__username || 'Unknown IT agent'
    ),
    datasets: [
      {
        label: 'Closed tickets',
        data: technicianDistribution.map((item) => item.count || 0),
        backgroundColor: '#5546e8',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const categoryChart = {
    labels: categoryDistribution.map(
      (item) => item.category__name || 'Uncategorized'
    ),
    datasets: [
      {
        label: 'Tickets',
        data: categoryDistribution.map((item) => item.count || 0),
        backgroundColor: '#8b5cf6',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const dailyChart = {
    labels: dailyTickets.map((item) => item.day || ''),
    datasets: [
      {
        label: 'Tickets created',
        data: dailyTickets.map((item) => item.count || 0),
        borderColor: '#5546e8',
        backgroundColor: 'rgba(85, 70, 232, 0.12)',
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: '#5546e8',
        pointRadius: 4,
        tension: 0.35,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 10,
          color: '#667085',
          font: {
            family: 'DM Sans',
            size: 12,
          },
          usePointStyle: true,
        },
      },
    },
  }

  const barOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#667085',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: '#edf0f5',
        },
        ticks: {
          color: '#98a2b3',
          precision: 0,
        },
      },
    },
  }

  const lineOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#667085',
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: '#edf0f5',
        },
        ticks: {
          color: '#98a2b3',
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-kicker">Helpdesk overview</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Track support requests, priorities, and IT team performance.
          </p>
        </div>
      </div>

      <section className="stats-grid">
        <article className="stat-card total">
          <span className="stat-label">Total Tickets</span>
          <strong className="stat-number">
            {data.total_tickets ?? 0}
          </strong>
        </article>

        <article className="stat-card open">
          <span className="stat-label">Open</span>
          <strong className="stat-number">
            {data.open_tickets ?? 0}
          </strong>
        </article>

        <article className="stat-card in-progress">
          <span className="stat-label">In Progress</span>
          <strong className="stat-number">
            {data.in_progress_tickets ?? 0}
          </strong>
        </article>

        <article className="stat-card closed">
          <span className="stat-label">Closed</span>
          <strong className="stat-number">
            {data.closed_tickets ?? 0}
          </strong>
        </article>
      </section>

      <section className="charts-grid">
        <article className="chart-card">
          <h2>Ticket Status</h2>

          <div className="chart-area doughnut-area">
            {statusDistribution.length > 0 ? (
              <Doughnut data={statusChart} options={chartOptions} />
            ) : (
              <EmptyChart message="Create tickets to see status data." />
            )}
          </div>
        </article>

        <article className="chart-card">
          <h2>Priority Distribution</h2>

          <div className="chart-area">
            {priorityDistribution.length > 0 ? (
              <Bar data={priorityChart} options={barOptions} />
            ) : (
              <EmptyChart message="No priority data yet." />
            )}
          </div>
        </article>

        <article className="chart-card">
          <h2>Closed Tickets by IT Agent</h2>

          <div className="chart-area">
            {technicianDistribution.length > 0 ? (
              <Bar data={technicianChart} options={barOptions} />
            ) : (
              <EmptyChart message="Close a ticket to record IT performance." />
            )}
          </div>
        </article>

        <article className="chart-card">
          <h2>Tickets by Category</h2>

          <div className="chart-area">
            {categoryDistribution.length > 0 ? (
              <Bar data={categoryChart} options={barOptions} />
            ) : (
              <EmptyChart message="No categories have been assigned yet." />
            )}
          </div>
        </article>

        <article className="chart-card chart-card-wide">
          <h2>Ticket Volume Over Time</h2>

          <div className="chart-area">
            {dailyTickets.length > 0 ? (
              <Line data={dailyChart} options={lineOptions} />
            ) : (
              <EmptyChart message="No ticket history is available yet." />
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default Dashboard