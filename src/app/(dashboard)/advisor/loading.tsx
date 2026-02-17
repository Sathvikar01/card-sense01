import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdvisorLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-44 mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-40 mt-4" />
        </CardContent>
      </Card>
    </div>
  )
}
