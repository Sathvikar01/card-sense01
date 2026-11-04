export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-8 h-8 w-40 shimmer" />
      <div className="space-y-3">
        <div className="h-14 shimmer rounded-xl" />
        <div className="h-14 shimmer rounded-xl" />
        <div className="h-14 shimmer rounded-xl" />
      </div>
    </div>
  )
}
