import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATHS = ['/dashboard', '/imoveis']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = ADMIN_PATHS.some((p) => path.startsWith(p))
  const isAdminApi =
    path.startsWith('/api/admin') && !path.startsWith('/api/admin/auth')

  if (!isAdminPath && !isAdminApi) return NextResponse.next()

  const cookieSecret = request.cookies.get('admin_secret')?.value
  const headerSecret = request.headers.get('x-admin-secret')
  const adminSecret = process.env.ADMIN_SECRET

  if (
    !adminSecret ||
    (cookieSecret !== adminSecret && headerSecret !== adminSecret)
  ) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/imoveis/:path*', '/api/admin/:path*'],
}
