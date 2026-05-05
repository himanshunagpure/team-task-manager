export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      {Icon && (
        <div className="mx-auto w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon size={22} className="text-surface-400" />
        </div>
      )}
      <h3 className="font-semibold text-surface-900 text-lg">{title}</h3>
      <p className="text-sm text-surface-500 mt-2 max-w-sm mx-auto leading-6">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
