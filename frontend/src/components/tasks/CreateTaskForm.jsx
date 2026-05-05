import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { taskApi } from '../../api/task.api'

export default function CreateTaskForm({ projectId, members = [], onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { priority: 'medium' } })

  const onSubmit = async (values) => {
    const { data } = await taskApi.create(projectId, values)
    onSuccess(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Title</label>
        <input className={`input ${errors.title ? 'input-error' : ''}`} {...register('title', { required: 'Title is required' })} />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea className="input min-h-20" {...register('description')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Assigned user</label>
          <select className="input" {...register('assignedTo', { required: true })}>
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member._id || member.email} value={member._id}>{member.fullName || member.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select className="input" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Due date</label>
        <input type="date" className="input" {...register('dueDate', { required: true })} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Create task
        </button>
      </div>
    </form>
  )
}
