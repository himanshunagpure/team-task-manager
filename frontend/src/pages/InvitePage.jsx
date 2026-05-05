import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { invitationApi } from '../api/invitation.api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, XCircle } from 'lucide-react'

export default function InvitePage() {
  const { token: pathToken } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryToken = new URLSearchParams(location.search).get('token')
  const token = pathToken || queryToken

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending') // pending | loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setMessage('Invite token is missing')
      setStatus('error')
      setLoading(false)
      return
    }

    invitationApi.getInvite(token)
      .then((data) => {
        setInvite(data)
        setLoading(false)
      })
      .catch((err) => {
        setMessage(err.message || 'Unable to load invitation')
        setStatus('error')
        setLoading(false)
      })
  }, [token])

  const handleAccept = useCallback(async () => {
    if (!token) return
    setStatus('loading')
    try {
      const data = await invitationApi.accept(token)
      setStatus('success')
      toast.success(data.message || 'You have joined the project!')
      navigate(`/projects/${data.projectId}`, { replace: true })
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }, [navigate, token])

  const inviteLink = `/invite?token=${token}`
  const redirectTo = encodeURIComponent(inviteLink)

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-surface-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-modal border border-surface-100 w-full max-w-md p-8 text-center animate-slide-up">
        <div className="mb-6">
          <span className="font-display font-700 text-surface-900 text-lg">TaskFlow</span>
        </div>

        {loading && (
          <>
            <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-4" />
            <h1 className="text-xl font-display font-700 text-surface-900 mb-2">Loading invitation...</h1>
            <p className="text-surface-500 text-sm">Checking invite details for this link.</p>
          </>
        )}

        {!loading && status === 'error' && (
          <>
            <XCircle size={40} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-display font-700 text-surface-900 mb-2">Invitation Error</h1>
            <p className="text-red-500 text-sm mb-4">{message || 'This invitation link is invalid or has expired.'}</p>
            <Link to="/dashboard" className="btn-secondary justify-center">Go to Dashboard</Link>
          </>
        )}

        {!loading && invite && status !== 'success' && (
          <>
            <h1 className="text-2xl font-display font-700 text-surface-900 mb-2">You're invited!</h1>
            <p className="text-surface-500 text-sm mb-4">You were invited to join <strong>{invite.projectName}</strong>.</p>
            <p className="text-surface-500 text-sm mb-6">Invite sent to <strong>{invite.invitedEmail}</strong>.</p>

            {!user ? (
              <>
                <div className="flex gap-3 mb-4">
                  <Link to={`/login?redirect=${redirectTo}`} className="btn-primary flex-1 justify-center">
                    Sign in
                  </Link>
                  <Link to={`/signup?redirect=${redirectTo}`} className="btn-secondary flex-1 justify-center">
                    Sign up
                  </Link>
                </div>
                <p className="text-surface-400 text-xs">After login, you will return here to accept the invite.</p>
              </>
            ) : (
              <>
                {invite.status === 'pending' ? (
                  <>
                    <button
                      onClick={handleAccept}
                      className="btn-primary w-full justify-center py-3 mb-3"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <><Loader2 size={16} className="animate-spin" /> Accepting...</>
                      ) : (
                        'Accept Invite'
                      )}
                    </button>
                    <p className="text-surface-500 text-sm">Click to join this project as a member.</p>
                  </>
                ) : (
                  <p className="text-surface-500 text-sm">This invitation is <strong>{invite.status}</strong>.</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
