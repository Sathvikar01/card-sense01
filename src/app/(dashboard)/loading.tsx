import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="mb-8 h-8 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  )
}
