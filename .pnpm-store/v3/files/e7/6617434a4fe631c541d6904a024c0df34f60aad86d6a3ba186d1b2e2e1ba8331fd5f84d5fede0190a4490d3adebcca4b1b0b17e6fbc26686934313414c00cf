import type { ClerkHostRouter } from '@clerk/shared/router';
import React from 'react';
import type { NextClerkProviderProps } from '../../types';
declare global {
    export interface Window {
        __clerk_nav_await: Array<(value: void) => void>;
        __clerk_nav: (to: string) => Promise<void>;
        __clerk_internal_invalidateCachePromise: () => void | undefined;
        next?: {
            version: string;
        };
    }
}
export declare const NEXT_WINDOW_HISTORY_SUPPORT_VERSION = "14.1.0";
/**
 * Clerk router integration with Next.js's router.
 */
export declare const useNextRouter: () => ClerkHostRouter;
export declare const ClientClerkProvider: (props: NextClerkProviderProps) => React.JSX.Element;
//# sourceMappingURL=ClerkProvider.d.ts.map