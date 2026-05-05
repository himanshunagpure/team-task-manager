import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-surface-950/55 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* UI polish: modal receives a stronger container treatment without changing its behavior. */}
      <div className="bg-white rounded-2xl shadow-modal border border-surface-100 w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
