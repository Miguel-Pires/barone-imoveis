import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = 'imoveis'

const headers = {
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
  'Content-Type': 'application/json',
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // 1. Lê estado atual do bucket
  const beforeRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, { headers })
  const before = await beforeRes.json()

  // 2. Tenta atualizar — file_size_limit: null herda o limite do projeto (50 MB no free tier)
  const putRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: null,
      allowed_mime_types: null,
    }),
  })
  const putBody = await putRes.json()

  // 3. Lê estado após a tentativa
  const afterRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, { headers })
  const after = await afterRes.json()

  return NextResponse.json({
    before,
    update: { status: putRes.status, body: putBody },
    after,
    env: { url: SUPABASE_URL, hasServiceKey: !!SERVICE_KEY },
  })
}
