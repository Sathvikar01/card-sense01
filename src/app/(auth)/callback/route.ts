import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = new URL('/auth/callback', url.origin)
  target.search = url.search
  return NextResponse.redirect(target)
}
