import { useEffect, useState, useRef } from 'react'
import { Bell, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationApi } from '../../api/notification.api'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [respondingId, setRespondingId] = useState(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const unreadCount = notifications.filter(
    (n) => n.status === 'unread'
  ).length

  const pendingInvitations = notifications.filter(
    (n) => n.type === 'project_invitation' && n.actionTaken === 'pending'
  )

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications()
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const handleRespond = async (notificationId, action) => {
    setRespondingId(notificationId)
    try {
      const result = await notificationApi.respondToInvitation(
        notificationId,
        action
      )

      if (action === 'accepted') {
        toast.success('You have joined the project!')
        if (result.data?.projectId) {
          setTimeout(() => {
            navigate(`/projects/${result.data.projectId}`)
          }, 1000)
        }
      } else {
        toast.success('Invitation declined')
      }

      await fetchNotifications()
    } catch (err) {
      toast.error(err.message || 'Failed to respond to invitation')
    } finally {
      setRespondingId(null)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId)
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-surface-200 z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-surface-50 border-b border-surface-200 p-4">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-surface-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-surface-50 transition-colors ${
                    notification.status === 'unread'
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <p className="text-sm font-medium text-surface-900 flex-1">
                      {notification.message}
                    </p>
                    {notification.status === 'unread' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                    )}
                  </div>

                  {notification.type ===
                    'project_invitation' &&
                    notification.actionTaken ===
                      'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() =>
                            handleRespond(
                              notification._id,
                              'accepted'
                            )
                          }
                          disabled={
                            respondingId ===
                            notification._id
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                          {respondingId ===
                          notification._id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={14} />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRespond(
                              notification._id,
                              'denied'
                            )
                          }
                          disabled={
                            respondingId ===
                            notification._id
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-200 hover:bg-surface-300 text-surface-900 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                          <X size={14} />
                          Deny
                        </button>
                      </div>
                    )}

                  {notification.actionTaken ===
                    'accepted' && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Accepted
                    </p>
                  )}

                  {notification.actionTaken ===
                    'denied' && (
                    <p className="text-xs text-red-600 mt-2">
                      ✗ Declined
                    </p>
                  )}

                  <p className="text-xs text-surface-400 mt-2">
                    {new Date(
                      notification.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


//notification bell component for showing the notifications to the user and also for accepting or denying the project invitations