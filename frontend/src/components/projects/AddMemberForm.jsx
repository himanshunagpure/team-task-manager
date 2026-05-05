import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { projectApi } from '../../api/project.api'
import toast from 'react-hot-toast'

export default function AddMemberForm({ projectId, onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (values) => {
    try {
      await projectApi.invite(projectId, values)
      onSuccess({ email: values.email, role: 'member' })
    } catch (err) {
      toast.error(err.message || 'Unable to send invite')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Member email</label>
        <input
          type="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
        <p className="text-xs text-surface-400 mt-2">The backend sends this user an invitation link.</p>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Send invite
        </button>
      </div>
    </form>
  )
}
