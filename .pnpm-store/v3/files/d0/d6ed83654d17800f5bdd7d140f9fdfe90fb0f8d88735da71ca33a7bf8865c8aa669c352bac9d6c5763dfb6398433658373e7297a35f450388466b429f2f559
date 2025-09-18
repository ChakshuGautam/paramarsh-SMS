import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuthObject, ClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, ClerkRequest, RedirectFun } from '@clerk/backend/internal';
import type { NextMiddleware, NextRequest } from 'next/server';
import type { AuthProtect } from './protect';
import type { NextMiddlewareEvtParam, NextMiddlewareRequestParam, NextMiddlewareReturn } from './types';
export type ClerkMiddlewareAuthObject = AuthObject & {
    protect: AuthProtect;
    redirectToSignIn: RedirectFun<Response>;
};
export type ClerkMiddlewareAuth = () => ClerkMiddlewareAuthObject;
type ClerkMiddlewareHandler = (auth: ClerkMiddlewareAuth, request: NextMiddlewareRequestParam, event: NextMiddlewareEvtParam) => NextMiddlewareReturn;
export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
    debug?: boolean;
};
type ClerkMiddlewareOptionsCallback = (req: NextRequest) => ClerkMiddlewareOptions;
/**
 * Middleware for Next.js that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://clerk.com/docs/references/nextjs/clerk-middleware
 */
interface ClerkMiddleware {
    /**
     * @example
     * export default clerkMiddleware((auth, request, event) => { ... }, options);
     */
    (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptions): NextMiddleware;
    /**
     * @example
     * export default clerkMiddleware((auth, request, event) => { ... }, (req) => options);
     */
    (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptionsCallback): NextMiddleware;
    /**
     * @example
     * export default clerkMiddleware(options);
     */
    (options?: ClerkMiddlewareOptions): NextMiddleware;
    /**
     * @example
     * export default clerkMiddleware;
     */
    (request: NextMiddlewareRequestParam, event: NextMiddlewareEvtParam): NextMiddlewareReturn;
}
export declare const clerkMiddlewareRequestDataStorage: AsyncLocalStorage<Map<"requestData", AuthenticateRequestOptions>>;
export declare const clerkMiddleware: ClerkMiddleware;
type AuthenticateRequest = Pick<ClerkClient, 'authenticateRequest'>['authenticateRequest'];
export declare const createAuthenticateRequestOptions: (clerkRequest: ClerkRequest, options: ClerkMiddlewareOptions) => Parameters<AuthenticateRequest>[1];
export {};
//# sourceMappingURL=clerkMiddleware.d.ts.map