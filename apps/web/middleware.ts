<<<<<<< HEAD
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/admin(.*)', // API proxy routes should be public, auth handled separately
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
=======
import { authMiddleware } from '@clerk/nextjs/server'

// This middleware protects all routes by default
// See https://clerk.com/docs/references/nextjs/auth-middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/health',
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    '/api/admin(.*)', // Proxy routes
    '/_next(.*)',
    '/favicon.ico',
  ],
  afterAuth(auth, req) {
    // If user is not signed in and trying to access /admin, redirect to our custom sign-in
    if (!auth.userId && req.nextUrl.pathname.startsWith('/admin')) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return Response.redirect(signInUrl);
    }
  },
>>>>>>> origin/main
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}