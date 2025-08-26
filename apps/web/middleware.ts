import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
])

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware((auth, request) => {
  const { userId } = auth()
  
  // If user is signed in and trying to access sign-in page, redirect to admin
  if (userId && request.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // If user is not signed in and trying to access protected route, redirect to sign-in
  if (!userId && isProtectedRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}