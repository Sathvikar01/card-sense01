import { getDbHealthStatus } from '@/lib/health/db-health'
import { DbHealthBannerClient } from './db-health-banner-client'

export async function DbHealthBanner() {
  const health = await getDbHealthStatus()

  if (health.missingTables.length === 0) {
    return null
  }

  return <DbHealthBannerClient missingTables={health.missingTables} />
}

