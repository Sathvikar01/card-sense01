import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BeginnerLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
