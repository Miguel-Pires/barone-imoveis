import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'barone_admin'
const COOKIE_VALUE = 'authenticated'

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)
  const isAuthenticated = cookie?.value === COOKIE_VALUE
  const path = request.nextUrl.pathname
  const isLoginPage = path === '/admin/login'
  const isAdminRoute = path.startsWith('/admin')

  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
