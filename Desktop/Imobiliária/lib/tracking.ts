declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

type TrackingEvent = 'view_property' | 'click_whatsapp' | 'submit_lead'

interface EventData {
  property_id?: string
  title?: string
  slug?: string
  source?: string
  interest?: string
}

export function trackEvent(name: TrackingEvent, data: EventData = {}) {
  if (typeof window === 'undefined') return
  if (window.fbq) window.fbq('track', name, data)
  if (window.gtag) window.gtag('event', name, data)
}
