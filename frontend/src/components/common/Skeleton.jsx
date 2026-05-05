export function SkeletonCard() {
  return <div className="card p-5 h-40 skeleton" />
}

export function SkeletonStat() {
  return <div className="card p-5 h-32 skeleton" />
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card overflow-hidden">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 border-b border-surface-100 last:border-0 skeleton" />
      ))}
    </div>
  )
}
