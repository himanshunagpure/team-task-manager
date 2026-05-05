import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { projectApi } from '../../api/project.api'

export default function CreateProjectForm({ onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (values) => {
    const { data } = await projectApi.create(values)
    onSuccess(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Project name</label>
        <input className={`input ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Project name is required' })} />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea className="input min-h-24" {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Create project
        </button>
      </div>
    </form>
  )
}
