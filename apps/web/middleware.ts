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
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}