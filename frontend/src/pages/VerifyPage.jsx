import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

export default function VerifyPage() {
  const { verify } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await verify({ otp: data.otp })
      toast.success('Account verified! Welcome to TaskFlow.')
      navigate(redirect ? redirect : '/dashboard')
    } catch (err) {
      toast.error(err.message || 'Verification failed')
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-7">
        <h1 className="text-3xl font-display font-700 text-white mb-2 leading-tight">Verify account</h1>
        <p className="text-surface-400 text-sm">Enter the OTP sent to your email.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">One-time password</label>
          <div className="relative">
            <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              {...register('otp', {
                required: 'OTP is required',
                minLength: { value: 4, message: 'OTP seems too short' },
              })}
              type="text"
              inputMode="numeric"
              placeholder="Enter your OTP"
              className={`input pl-9 bg-white/10 border-white/20 text-white placeholder-surface-500 focus:bg-white/15 ${errors.otp ? 'input-error' : ''}`}
            />
          </div>
          {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3 mt-2"
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Verifying...</>
          ) : (
            <>Verify account <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  )
}