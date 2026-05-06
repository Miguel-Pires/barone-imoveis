import { NextRequest } from 'next/server'

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'barone2024'
export const COOKIE_NAME = 'barone_admin'
export const COOKIE_VALUE = 'authenticated'

export function checkAdminAuth(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE
}
