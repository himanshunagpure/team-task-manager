import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await signup({ fullName: data.fullName, email: data.email, password: data.password })
      toast.success('Account created! Please check your email for OTP to verify your account.')
      navigate(redirect ? `/verify?redirect=${encodeURIComponent(redirect)}` : '/verify')
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    }
  }

  const inputBase =
    'w-full pl-9 pr-3.5 py-[11px] border rounded-xl text-[0.9rem] font-[DM_Sans,sans-serif] ' +
    'text-gray-900 bg-white placeholder:text-[#b0b7c3] outline-none ' +
    'transition-[border-color,box-shadow,background] duration-200 ' +
    'shadow-[0_1px_3px_rgba(0,0,0,0.04)] box-border '

  const inputNormal = inputBase +
    'border-gray-200 focus:border-indigo-500 focus:ring-[3.5px] focus:ring-indigo-100 focus:bg-gray-50'

  const inputError = inputBase +
    'border-red-400 ring-[3px] ring-red-100'

  const inputClass = (hasError) => hasError ? inputError : inputNormal

  return (
    <div className="animate-[slideUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">

      {/* Heading */}
      <div className="mb-7">
        <h1 className="font-serif text-[2.05rem] font-normal text-white leading-[1.15] tracking-[-0.5px] mb-1.5">
          Create account
        </h1>
        <p className="text-sm text-gray-500 font-normal">
          Join your team on TaskFlow. It&rsquo;s free.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">

        {/* Full name */}
        <div>
          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1.5 tracking-[0.01em]">
            Full name
          </label>
          <div className="relative group">
            <input
              {...register('fullName', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Too short' },
              })}
              placeholder="John Smith"
              className={inputClass(errors.fullName)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                             transition-colors duration-200 group-focus-within:text-indigo-500">
              <User size={15} />
            </span>
          </div>
          {errors.fullName && (
            <p className="text-[0.75rem] text-red-500 mt-[5px]">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1.5 tracking-[0.01em]">
            Email address
          </label>
          <div className="relative group">
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
              type="email"
              placeholder="you@company.com"
              className={inputClass(errors.email)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                             transition-colors duration-200 group-focus-within:text-indigo-500">
              <Mail size={15} />
            </span>
          </div>
          {errors.email && (
            <p className="text-[0.75rem] text-red-500 mt-[5px]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1.5 tracking-[0.01em]">
            Password
          </label>
          <div className="relative group">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
              type="password"
              placeholder="Min. 6 characters"
              className={inputClass(errors.password)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                             transition-colors duration-200 group-focus-within:text-indigo-500">
              <Lock size={15} />
            </span>
          </div>
          {errors.password && (
            <p className="text-[0.75rem] text-red-500 mt-[5px]">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1.5 tracking-[0.01em]">
            Confirm password
          </label>
          <div className="relative group">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
              type="password"
              placeholder="Repeat password"
              className={inputClass(errors.confirmPassword)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                             transition-colors duration-200 group-focus-within:text-indigo-500">
              <Lock size={15} />
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-[0.75rem] text-red-500 mt-[5px]">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-[7px] w-full px-5 py-[13px] mt-1
                     border-none rounded-xl text-[0.9rem] font-semibold text-white tracking-[0.01em]
                     bg-gradient-to-br from-indigo-500 to-indigo-600
                     shadow-[0_4px_14px_rgba(99,102,241,0.35),0_1px_3px_rgba(0,0,0,0.08)]
                     transition-all duration-200 cursor-pointer
                     hover:shadow-[0_6px_20px_rgba(99,102,241,0.45),0_2px_6px_rgba(0,0,0,0.1)] hover:-translate-y-px
                     active:translate-y-0
                     disabled:opacity-[0.68] disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link
          to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors duration-200 no-underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}