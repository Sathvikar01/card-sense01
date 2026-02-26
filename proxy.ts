import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*'],
}

export default function proxy(request: NextRequest) {
  void request
  return NextResponse.next()
}
