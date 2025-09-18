import type { AuthenticateRequestOptions, ClerkRequest, RequestState } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { NextResponse } from 'next/server';
import type { RequestLike } from './types';
export declare function getCustomAttributeFromRequest(req: RequestLike, key: string): string | null | undefined;
export declare function getAuthKeyFromRequest(req: RequestLike, key: keyof typeof constants.Attributes): string | null | undefined;
export declare function getHeader(req: RequestLike, name: string): string | null | undefined;
export declare function getCookie(req: RequestLike, name: string): string | undefined;
export declare const setRequestHeadersOnNextResponse: (res: NextResponse | Response, req: Request, newHeaders: Record<string, string>) => void;
export declare const injectSSRStateIntoObject: <O, T>(obj: O, authObject: T) => O & {
    __clerk_ssr_state: T;
};
export declare function decorateRequest(req: ClerkRequest, res: Response, requestState: RequestState, requestData?: AuthenticateRequestOptions): Response;
export declare const apiEndpointUnauthorizedNextResponse: () => NextResponse<null>;
export declare const handleMultiDomainAndProxy: (clerkRequest: ClerkRequest, opts: AuthenticateRequestOptions) => {
    proxyUrl: string;
    isSatellite: boolean;
    domain: string;
    signInUrl: string;
};
export declare const redirectAdapter: (url: string | URL) => NextResponse<unknown>;
export declare function assertKey(key: string, onError: () => never): string;
/**
 * Assert that the provided token generates a matching signature.
 */
export declare function assertTokenSignature(token: string, key: string, signature?: string | null): void;
/**
 * Encrypt request data propagated between server requests.
 * @internal
 **/
export declare function encryptClerkRequestData(requestData?: Partial<AuthenticateRequestOptions>): string | undefined;
/**
 * Decrypt request data propagated between server requests.
 * @internal
 */
export declare function decryptClerkRequestData(encryptedRequestData?: string | undefined | null): Partial<AuthenticateRequestOptions>;
//# sourceMappingURL=utils.d.ts.map