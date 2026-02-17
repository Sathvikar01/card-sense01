import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
        <p className="text-gray-600 mt-1">
          View your AI-powered card recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            No Recommendations Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your recommendation history will appear here once you get your first recommendation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
