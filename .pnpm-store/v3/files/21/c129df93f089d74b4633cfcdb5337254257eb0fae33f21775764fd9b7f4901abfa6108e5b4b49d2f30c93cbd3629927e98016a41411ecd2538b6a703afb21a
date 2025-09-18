"use client";
import { ClerkProvider as ReactClerkProvider } from "@clerk/clerk-react";
import { ClerkHostRouterContext } from "@clerk/shared/router";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useTransition } from "react";
import { useSafeLayoutEffect } from "../../client-boundary/hooks/useSafeLayoutEffect";
import { ClerkNextOptionsProvider } from "../../client-boundary/NextOptionsContext";
import { ClerkJSScript } from "../../utils/clerk-js-script";
import { mergeNextClerkPropsWithEnv } from "../../utils/mergeNextClerkPropsWithEnv";
import { invalidateCacheAction } from "../server-actions";
import { useAwaitablePush } from "./useAwaitablePush";
import { useAwaitableReplace } from "./useAwaitableReplace";
const NEXT_WINDOW_HISTORY_SUPPORT_VERSION = "14.1.0";
const useNextRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = typeof window === "undefined" ? new URLSearchParams() : useSearchParams();
  const canUseWindowHistoryAPIs = typeof window !== "undefined" && window.next && window.next.version >= NEXT_WINDOW_HISTORY_SUPPORT_VERSION;
  return {
    mode: "path",
    name: "NextRouter",
    push: (path) => router.push(path),
    replace: (path) => canUseWindowHistoryAPIs ? window.history.replaceState(null, "", path) : router.replace(path),
    shallowPush(path) {
      canUseWindowHistoryAPIs ? window.history.pushState(null, "", path) : router.push(path, {});
    },
    pathname: () => pathname,
    searchParams: () => searchParams
  };
};
const ClientClerkProvider = (props) => {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true, children } = props;
  const router = useRouter();
  const clerkRouter = useNextRouter();
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    var _a;
    if (!isPending) {
      (_a = window.__clerk_internal_invalidateCachePromise) == null ? void 0 : _a.call(window);
    }
  }, [isPending]);
  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = () => {
      return new Promise((res) => {
        window.__clerk_internal_invalidateCachePromise = res;
        startTransition(() => {
          var _a;
          if (((_a = window.next) == null ? void 0 : _a.version) && typeof window.next.version === "string" && window.next.version.startsWith("13")) {
            router.refresh();
          } else {
            void invalidateCacheAction();
          }
        });
      });
    };
    window.__unstable__onAfterSetActive = () => {
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        return router.refresh();
      }
    };
  }, []);
  const mergedProps = mergeNextClerkPropsWithEnv({
    ...props,
    routerPush: push,
    routerReplace: replace
  });
  return /* @__PURE__ */ React.createElement(ClerkNextOptionsProvider, { options: mergedProps }, /* @__PURE__ */ React.createElement(ReactClerkProvider, { ...mergedProps }, /* @__PURE__ */ React.createElement(ClerkJSScript, { router: "app" }), /* @__PURE__ */ React.createElement(ClerkHostRouterContext.Provider, { value: clerkRouter }, children)));
};
export {
  ClientClerkProvider,
  NEXT_WINDOW_HISTORY_SUPPORT_VERSION,
  useNextRouter
};
//# sourceMappingURL=ClerkProvider.js.map