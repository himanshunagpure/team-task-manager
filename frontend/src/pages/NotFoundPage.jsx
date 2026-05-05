import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center animate-slide-up">
        <h1 className="text-8xl font-display font-800 text-brand-200 mb-4">404</h1>
        <h2 className="text-2xl font-display font-700 text-surface-800 mb-2 leading-tight">Page not found</h2>
        <p>page is not working due to sum condition</p>
        <p className="text-surface-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn-primary">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
