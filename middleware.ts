import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
      if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/favicon.ico') ||
      url.pathname.startsWith('/prelaunch')){
         return NextResponse.next()

      }else {
    return NextResponse.redirect(new URL('/prelaunch', request.url))
  }
}
