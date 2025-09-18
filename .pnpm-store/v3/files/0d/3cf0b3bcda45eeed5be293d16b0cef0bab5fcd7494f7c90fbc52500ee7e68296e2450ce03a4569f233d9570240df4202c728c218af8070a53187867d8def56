import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { NextClerkProviderProps } from '../../types';
declare global {
    interface Window {
        __clerk_internal_navigations: Record<string, {
            fun: NonNullable<NextClerkProviderProps['routerPush'] | NextClerkProviderProps['routerReplace']>;
            promisesBuffer: Array<() => void> | undefined;
        }>;
    }
}
export declare const useInternalNavFun: (props: {
    windowNav: typeof window.history.pushState | typeof window.history.replaceState | undefined;
    routerNav: AppRouterInstance["push"] | AppRouterInstance["replace"];
    name: string;
}) => (to: string) => unknown;
//# sourceMappingURL=useInternalNavFun.d.ts.map