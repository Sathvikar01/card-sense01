import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const BODY_LINE_WIDTHS = [96, 90, 85, 92, 78, 88, 82, 94, 87, 80, 91, 76]

export default function ArticleLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-36" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Card>
            <CardContent className="pt-6 space-y-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-4 w-full"
                  style={{ width: `${BODY_LINE_WIDTHS[i % BODY_LINE_WIDTHS.length]}%` }}
                />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
