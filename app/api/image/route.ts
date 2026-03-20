import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = [
  'covers.openlibrary.org',
  'openlibrary.org',
  'books.google.com',
  'books.google.co.uk',
  'encrypted-tbn0.gstatic.com',
  'lh3.googleusercontent.com',
  '*.googleusercontent.com',
  '*.gstatic.com',
  'storage.googleapis.com',
]

function isHostAllowed(hostname: string): boolean {
  return ALLOWED_HOSTS.some((pattern) => {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1)
      return hostname === suffix.slice(1) || hostname.endsWith(suffix)
    }
    return hostname === pattern || hostname.endsWith('.' + pattern)
  })
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (!isHostAllowed(parsed.hostname)) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Bookmark/1.0' },
      cache: 'force-cache',
    })
    if (!res.ok) return new NextResponse(null, { status: 404 })
    const blob = await res.blob()
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
