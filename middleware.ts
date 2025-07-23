import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateCloudflareAccess } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // In local development, bypass Zero Trust authentication
    if (process.env.NODE_ENV === 'development' || request.nextUrl.hostname === 'localhost') {
      console.log('Local development: bypassing Zero Trust authentication')
      return NextResponse.next()
    }
    
    // In production, validate Cloudflare Access token
    const validation = await validateCloudflareAccess(request)
    
    if (!validation.isValid) {
      // Redirect to Cloudflare Access login
      const teamName = process.env.CLOUDFLARE_ACCESS_TEAM_NAME
      if (!teamName) {
        console.error('CLOUDFLARE_ACCESS_TEAM_NAME not configured')
        return NextResponse.json({ error: 'Authentication not configured' }, { status: 500 })
      }
      
      const loginUrl = `https://${teamName}.cloudflareaccess.com/cdn-cgi/access/login/${request.nextUrl.hostname}${request.nextUrl.pathname}`
      return NextResponse.redirect(loginUrl)
    }
    
    // User is authenticated, continue to admin area
    return NextResponse.next()
  }
  
  // For non-admin routes, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 