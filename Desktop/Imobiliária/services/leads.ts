import { createPublicClient } from '@/lib/supabase/public'
import { Lead } from '@/types/property'

export async function insertLead(
  lead: Omit<Lead, 'id' | 'created_at'>
): Promise<void> {
  const supabase = createPublicClient()
  const { error } = await supabase.from('leads').insert(lead)
  if (error) throw new Error(error.message)
}
