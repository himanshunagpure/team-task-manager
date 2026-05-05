import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <main className="min-h-screen bg-surface-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* UI polish: subtle layered background adds depth while keeping the auth form clean and focused. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.28),transparent_32rem),radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.16),transparent_28rem)]" />
      <section className="w-full max-w-md relative">
        <div className="mb-8">
          <span className="font-display font-700 text-white text-xl leading-none">TaskFlow</span>
          <p className="text-xs text-surface-500 mt-1">Modern team operations</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-7 shadow-modal backdrop-blur-xl">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
