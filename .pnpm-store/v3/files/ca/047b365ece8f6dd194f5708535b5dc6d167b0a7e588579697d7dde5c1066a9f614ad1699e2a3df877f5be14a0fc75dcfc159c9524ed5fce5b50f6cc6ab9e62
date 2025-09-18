import { AsyncLocalStorage } from "node:async_hooks";
import { AuthStatus, constants, createClerkRequest, createRedirect } from "@clerk/backend/internal";
import { eventMethodCalled } from "@clerk/shared/telemetry";
import { NextResponse } from "next/server";
import { isRedirect, serverRedirectWithAuth, setHeader } from "../utils";
import { withLogger } from "../utils/debugLogger";
import { clerkClient } from "./clerkClient";
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from "./constants";
import { errorThrower } from "./errorThrower";
import { createProtect } from "./protect";
import {
  assertKey,
  decorateRequest,
  handleMultiDomainAndProxy,
  redirectAdapter,
  setRequestHeadersOnNextResponse
} from "./utils";
const CONTROL_FLOW_ERROR = {
  FORCE_NOT_FOUND: "CLERK_PROTECT_REWRITE",
  REDIRECT_TO_URL: "CLERK_PROTECT_REDIRECT_TO_URL",
  REDIRECT_TO_SIGN_IN: "CLERK_PROTECT_REDIRECT_TO_SIGN_IN"
};
const clerkMiddlewareRequestDataStore = /* @__PURE__ */ new Map();
const clerkMiddlewareRequestDataStorage = new AsyncLocalStorage();
const clerkMiddleware = (...args) => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);
  return clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const nextMiddleware = withLogger("clerkMiddleware", (logger) => async (request2, event2) => {
      const resolvedParams = typeof params === "function" ? params(request2) : params;
      const publishableKey = assertKey(
        resolvedParams.publishableKey || PUBLISHABLE_KEY,
        () => errorThrower.throwMissingPublishableKeyError()
      );
      const secretKey = assertKey(
        resolvedParams.secretKey || SECRET_KEY,
        () => errorThrower.throwMissingSecretKeyError()
      );
      const signInUrl = resolvedParams.signInUrl || SIGN_IN_URL;
      const signUpUrl = resolvedParams.signUpUrl || SIGN_UP_URL;
      const options = {
        publishableKey,
        secretKey,
        signInUrl,
        signUpUrl,
        ...resolvedParams
      };
      clerkMiddlewareRequestDataStore.set("requestData", options);
      clerkClient().telemetry.record(
        eventMethodCalled("clerkMiddleware", {
          handler: Boolean(handler),
          satellite: Boolean(options.isSatellite),
          proxy: Boolean(options.proxyUrl)
        })
      );
      if (options.debug) {
        logger.enable();
      }
      const clerkRequest = createClerkRequest(request2);
      logger.debug("options", options);
      logger.debug("url", () => clerkRequest.toJSON());
      const requestState = await clerkClient().authenticateRequest(
        clerkRequest,
        createAuthenticateRequestOptions(clerkRequest, options)
      );
      logger.debug("requestState", () => ({
        status: requestState.status,
        headers: JSON.stringify(Object.fromEntries(requestState.headers)),
        reason: requestState.reason
      }));
      const locationHeader = requestState.headers.get(constants.Headers.Location);
      if (locationHeader) {
        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error("Clerk: handshake status without redirect");
      }
      const authObject = requestState.toAuth();
      logger.debug("auth", () => ({ auth: authObject, debug: authObject.debug() }));
      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);
      const authObjWithMethods = Object.assign(authObject, { protect, redirectToSignIn });
      let handlerResult = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStorage.run(
          clerkMiddlewareRequestDataStore,
          async () => handler == null ? void 0 : handler(() => authObjWithMethods, request2, event2)
        );
        handlerResult = userHandlerResult || handlerResult;
      } catch (e) {
        handlerResult = handleControlFlowErrors(e, clerkRequest, requestState);
      }
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
          handlerResult.headers.append(key, value);
        });
      }
      if (isRedirect(handlerResult)) {
        logger.debug("handlerResult is redirect");
        return serverRedirectWithAuth(clerkRequest, handlerResult, options);
      }
      if (options.debug) {
        setRequestHeadersOnNextResponse(handlerResult, clerkRequest, { [constants.Headers.EnableDebug]: "true" });
      }
      decorateRequest(clerkRequest, handlerResult, requestState, resolvedParams);
      return handlerResult;
    });
    if (request && event) {
      return nextMiddleware(request, event);
    }
    return nextMiddleware;
  });
};
const parseRequestAndEvent = (args) => {
  return [args[0] instanceof Request ? args[0] : void 0, args[0] instanceof Request ? args[1] : void 0];
};
const parseHandlerAndOptions = (args) => {
  return [
    typeof args[0] === "function" ? args[0] : void 0,
    (args.length === 2 ? args[1] : typeof args[0] === "function" ? {} : args[0]) || {}
  ];
};
const createAuthenticateRequestOptions = (clerkRequest, options) => {
  return {
    ...options,
    ...handleMultiDomainAndProxy(clerkRequest, options)
  };
};
const createMiddlewareRedirectToSignIn = (clerkRequest) => {
  return (opts = {}) => {
    const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN);
    err.returnBackUrl = opts.returnBackUrl === null ? "" : opts.returnBackUrl || clerkRequest.clerkUrl.toString();
    throw err;
  };
};
const createMiddlewareProtect = (clerkRequest, authObject, redirectToSignIn) => {
  return (params, options) => {
    const notFound = () => {
      throw new Error(CONTROL_FLOW_ERROR.FORCE_NOT_FOUND);
    };
    const redirect = (url) => {
      const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_URL);
      err.redirectUrl = url;
      throw err;
    };
    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  };
};
const handleControlFlowErrors = (e, clerkRequest, requestState) => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.FORCE_NOT_FOUND:
      return setHeader(
        NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
        constants.Headers.AuthReason,
        "protect-rewrite"
      );
    case CONTROL_FLOW_ERROR.REDIRECT_TO_URL:
      return redirectAdapter(e.redirectUrl);
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return createRedirect({
        redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        publishableKey: requestState.publishableKey
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
export {
  clerkMiddleware,
  clerkMiddlewareRequestDataStorage,
  createAuthenticateRequestOptions
};
//# sourceMappingURL=clerkMiddleware.js.map