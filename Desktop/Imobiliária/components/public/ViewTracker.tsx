'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/tracking'

export function ViewTracker({ slug, propertyId }: { slug: string; propertyId: string }) {
  useEffect(() => {
    trackEvent('view_property', { property_id: propertyId, slug })
    fetch(`/api/properties/${slug}/view`, { method: 'POST' })
  }, [slug, propertyId])
  return null
}
