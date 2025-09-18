import type { AuthObject } from '@clerk/backend';
import type { RedirectFun } from '@clerk/backend/internal';
import { redirect } from 'next/navigation';
import type { AuthProtect } from '../../server/protect';
type Auth = AuthObject & {
    protect: AuthProtect;
    redirectToSignIn: RedirectFun<ReturnType<typeof redirect>>;
};
export declare const auth: () => Auth;
export declare const initialState: () => Record<string, unknown>;
export {};
//# sourceMappingURL=auth.d.ts.map