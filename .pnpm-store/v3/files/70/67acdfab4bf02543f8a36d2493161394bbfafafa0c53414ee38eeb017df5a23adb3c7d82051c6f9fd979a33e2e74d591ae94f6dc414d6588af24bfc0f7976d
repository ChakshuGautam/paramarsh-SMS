import type { AuthObject } from '@clerk/backend';
import type { RedirectFun, SignedInAuthObject } from '@clerk/backend/internal';
import type { CheckAuthorizationParamsWithCustomPermissions, CheckAuthorizationWithCustomPermissions } from '@clerk/types';
type AuthProtectOptions = {
    unauthorizedUrl?: string;
    unauthenticatedUrl?: string;
};
/**
 * Throws a Nextjs notFound error if user is not authenticated or authorized.
 */
export interface AuthProtect {
    (params?: CheckAuthorizationParamsWithCustomPermissions, options?: AuthProtectOptions): SignedInAuthObject;
    (params?: (has: CheckAuthorizationWithCustomPermissions) => boolean, options?: AuthProtectOptions): SignedInAuthObject;
    (options?: AuthProtectOptions): SignedInAuthObject;
}
export declare const createProtect: (opts: {
    request: Request;
    authObject: AuthObject;
    /**
     * middleware and pages throw a notFound error if signed out
     * but the middleware needs to throw an error it can catch
     * use this callback to customise the behavior
     */
    notFound: () => never;
    /**
     * see {@link notFound} above
     */
    redirect: (url: string) => void;
    /**
     * protect() in middleware redirects to signInUrl if signed out
     * protect() in pages throws a notFound error if signed out
     * use this callback to customise the behavior
     */
    redirectToSignIn: RedirectFun<unknown>;
}) => AuthProtect;
export {};
//# sourceMappingURL=protect.d.ts.map