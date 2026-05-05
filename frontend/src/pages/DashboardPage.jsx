import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard.api'
import { useAuth } from '../context/AuthContext'
import { SkeletonStat } from '../components/common/Skeleton'
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, ArrowRight } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

const statCards = (stats) => [
  {
    label: 'Total Tasks',
    value: stats.total ?? 0,
    icon: ListTodo,
    color: 'bg-brand-50 text-brand-600',
    change: stats.totalChange,
  },
  {
    label: 'Completed',
    value: stats.completed ?? 0,
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600',
    change: stats.completedChange,
  },
  {
    label: 'In Progress',
    value: stats.inProgress ?? 0,
    icon: Clock,
    color: 'bg-blue-50 text-blue-600',
    change: stats.inProgressChange,
  },
  {
    label: 'Overdue',
    value: stats.overdue ?? 0,
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    change: stats.overdueChange,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const pieData = stats ? [
    { name: 'To Do', value: (stats.total || 0) - (stats.completed || 0) - (stats.inProgress || 0) - (stats.overdue || 0) },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Done', value: stats.completed || 0 },
    { name: 'Overdue', value: stats.overdue || 0 },
  ].filter(d => d.value > 0) : []

  const barData = stats?.tasksPerUser || []

  const greeting = new Date().getHours() < 12 ? 'Good morning' :
    new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-7 animate-fade-in">
      {/* UI polish: stronger dashboard heading creates a clearer first-read hierarchy. */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-700 text-surface-900 leading-tight">
            {greeting}, {user?.fullName?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-surface-500 text-sm mt-2">Here's what's happening across your workspace.</p>
        </div>
        <Link to="/projects" className="btn-primary hidden sm:inline-flex">
          View Projects <ArrowRight size={15} />
        </Link>
      </div>

      {/* UI polish: roomier cards improve scanability without changing the data shown. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : error ? (
          <div className="col-span-4 card p-6 text-center text-red-500 text-sm">{error}</div>
        ) : (
          statCards(stats || {}).map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="card p-5 sm:p-6 animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon size={17} />
                </div>
                {change !== undefined && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <TrendingUp size={11} className={change < 0 ? 'rotate-180' : ''} />
                    {Math.abs(change)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-display font-700 text-surface-900 leading-none">{value}</p>
              <p className="text-sm text-surface-500 mt-1">{label}</p>
            </div>
          ))
        )}
      </div>

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="card p-5 sm:p-6 lg:col-span-2">
            <h3 className="font-semibold text-surface-800 mb-5">Task Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-surface-400 text-sm">No data available</div>
            )}
          </div>

          <div className="card p-5 sm:p-6 lg:col-span-3">
            <h3 className="font-semibold text-surface-800 mb-5">Tasks per Team Member</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                  />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-surface-400 text-sm">No team data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
