import { AuthStatus, constants, createClerkRequest, createRedirect } from "@clerk/backend/internal";
import { isDevelopmentFromSecretKey } from "@clerk/shared/keys";
import { eventMethodCalled } from "@clerk/shared/telemetry";
import { NextResponse } from "next/server";
import { isRedirect, mergeResponses, serverRedirectWithAuth, setHeader, stringifyHeaders } from "../utils";
import { withLogger } from "../utils/debugLogger";
import { clerkClient } from "./clerkClient";
import { createAuthenticateRequestOptions } from "./clerkMiddleware";
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from "./constants";
import { informAboutProtectedRouteInfo, receivedRequestForIgnoredRoute } from "./errors";
import { errorThrower } from "./errorThrower";
import { createRouteMatcher } from "./routeMatcher";
import {
  apiEndpointUnauthorizedNextResponse,
  assertKey,
  decorateRequest,
  redirectAdapter,
  setRequestHeadersOnNextResponse
} from "./utils";
const DEFAULT_CONFIG_MATCHER = ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"];
const DEFAULT_IGNORED_ROUTES = [`/((?!api|trpc))(_next.*|.+\\.[\\w]+$)`];
const DEFAULT_API_ROUTES = ["/api/(.*)", "/trpc/(.*)"];
const authMiddleware = (...args) => {
  const [params = {}] = args;
  const publishableKey = assertKey(
    params.publishableKey || PUBLISHABLE_KEY,
    () => errorThrower.throwMissingPublishableKeyError()
  );
  const secretKey = assertKey(params.secretKey || SECRET_KEY, () => errorThrower.throwMissingPublishableKeyError());
  const signInUrl = params.signInUrl || SIGN_IN_URL;
  const signUpUrl = params.signUpUrl || SIGN_UP_URL;
  const options = { ...params, publishableKey, secretKey, signInUrl, signUpUrl };
  const isIgnoredRoute = createRouteMatcher(options.ignoredRoutes || DEFAULT_IGNORED_ROUTES);
  const isPublicRoute = createRouteMatcher(withDefaultPublicRoutes(options.publicRoutes));
  const isApiRoute = createApiRoutes(options.apiRoutes);
  const defaultAfterAuth = createDefaultAfterAuth(isPublicRoute, isApiRoute, options);
  clerkClient.telemetry.record(
    eventMethodCalled("authMiddleware", {
      publicRoutes: Boolean(options.publicRoutes),
      ignoredRoutes: Boolean(options.ignoredRoutes),
      beforeAuth: Boolean(options.beforeAuth),
      afterAuth: Boolean(options.afterAuth)
    })
  );
  return withLogger("authMiddleware", (logger) => async (_req, evt) => {
    if (options.debug) {
      logger.enable();
    }
    const clerkRequest = createClerkRequest(_req);
    const nextRequest = withNormalizedClerkUrl(clerkRequest, _req);
    logger.debug("URL debug", {
      url: nextRequest.nextUrl.href,
      method: nextRequest.method,
      headers: stringifyHeaders(nextRequest.headers),
      nextUrl: nextRequest.nextUrl.href,
      clerkUrl: nextRequest.experimental_clerkUrl.href
    });
    logger.debug("Options debug", { ...options, beforeAuth: !!options.beforeAuth, afterAuth: !!options.afterAuth });
    if (isIgnoredRoute(nextRequest)) {
      logger.debug({ isIgnoredRoute: true });
      if (isDevelopmentFromSecretKey(options.secretKey) && !options.ignoredRoutes) {
        console.warn(
          receivedRequestForIgnoredRoute(
            nextRequest.experimental_clerkUrl.href,
            JSON.stringify(DEFAULT_CONFIG_MATCHER)
          )
        );
      }
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, "ignored-route");
    }
    const beforeAuthRes = await (options.beforeAuth && options.beforeAuth(nextRequest, evt));
    if (beforeAuthRes === false) {
      logger.debug("Before auth returned false, skipping");
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, "skip");
    } else if (beforeAuthRes && isRedirect(beforeAuthRes)) {
      logger.debug("Before auth returned redirect, following redirect");
      return setHeader(beforeAuthRes, constants.Headers.AuthReason, "before-auth-redirect");
    }
    const requestState = await clerkClient.authenticateRequest(
      clerkRequest,
      createAuthenticateRequestOptions(clerkRequest, options)
    );
    const locationHeader = requestState.headers.get("location");
    if (locationHeader) {
      return new Response(null, { status: 307, headers: requestState.headers });
    }
    if (requestState.status === AuthStatus.Handshake) {
      throw new Error("Clerk: unexpected handshake without redirect");
    }
    const auth = Object.assign(requestState.toAuth(), {
      isPublicRoute: isPublicRoute(nextRequest),
      isApiRoute: isApiRoute(nextRequest)
    });
    logger.debug(() => ({ auth: JSON.stringify(auth), debug: auth.debug() }));
    const afterAuthRes = await (options.afterAuth || defaultAfterAuth)(auth, nextRequest, evt);
    const finalRes = mergeResponses(beforeAuthRes, afterAuthRes) || NextResponse.next();
    logger.debug(() => ({ mergedHeaders: stringifyHeaders(finalRes.headers) }));
    if (isRedirect(finalRes)) {
      logger.debug("Final response is redirect, following redirect");
      return serverRedirectWithAuth(clerkRequest, finalRes, options);
    }
    if (options.debug) {
      setRequestHeadersOnNextResponse(finalRes, nextRequest, { [constants.Headers.EnableDebug]: "true" });
      logger.debug(`Added ${constants.Headers.EnableDebug} on request`);
    }
    const result = decorateRequest(clerkRequest, finalRes, requestState, { secretKey }) || NextResponse.next();
    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        result.headers.append(key, value);
      });
    }
    return result;
  });
};
const createDefaultAfterAuth = (isPublicRoute, isApiRoute, options) => {
  return (auth, req) => {
    if (!auth.userId && !isPublicRoute(req)) {
      if (isApiRoute(req)) {
        informAboutProtectedRoute(req.experimental_clerkUrl.pathname, options, true);
        return apiEndpointUnauthorizedNextResponse();
      } else {
        informAboutProtectedRoute(req.experimental_clerkUrl.pathname, options, false);
      }
      return createRedirect({
        redirectAdapter,
        signInUrl: options.signInUrl,
        signUpUrl: options.signUpUrl,
        publishableKey: options.publishableKey,
        // We're setting baseUrl to '' here as we want to keep the legacy behavior of
        // the redirectToSignIn, redirectToSignUp helpers in the backend package.
        baseUrl: ""
      }).redirectToSignIn({ returnBackUrl: req.experimental_clerkUrl.href });
    }
    return NextResponse.next();
  };
};
const matchRoutesStartingWith = (path) => {
  path = path.replace(/\/$/, "");
  return new RegExp(`^${path}(/.*)?$`);
};
const withDefaultPublicRoutes = (publicRoutes) => {
  if (typeof publicRoutes === "function") {
    return publicRoutes;
  }
  const routes = [publicRoutes || ""].flat().filter(Boolean);
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "";
  if (signInUrl) {
    routes.push(matchRoutesStartingWith(signInUrl));
  }
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "";
  if (signUpUrl) {
    routes.push(matchRoutesStartingWith(signUpUrl));
  }
  return routes;
};
const createApiRoutes = (apiRoutes) => {
  if (apiRoutes) {
    return createRouteMatcher(apiRoutes);
  }
  const isDefaultApiRoute = createRouteMatcher(DEFAULT_API_ROUTES);
  return (req) => isDefaultApiRoute(req) || isRequestMethodIndicatingApiRoute(req) || isRequestContentTypeJson(req);
};
const isRequestContentTypeJson = (req) => {
  const requestContentType = req.headers.get(constants.Headers.ContentType);
  return requestContentType === constants.ContentTypes.Json;
};
const isRequestMethodIndicatingApiRoute = (req) => {
  const requestMethod = req.method.toLowerCase();
  return !["get", "head", "options"].includes(requestMethod);
};
const withNormalizedClerkUrl = (clerkRequest, nextRequest) => {
  const res = nextRequest.nextUrl.clone();
  res.port = clerkRequest.clerkUrl.port;
  res.protocol = clerkRequest.clerkUrl.protocol;
  res.host = clerkRequest.clerkUrl.host;
  return Object.assign(nextRequest, { experimental_clerkUrl: res });
};
const informAboutProtectedRoute = (path, options, isApiRoute) => {
  if (options.debug || isDevelopmentFromSecretKey(options.secretKey)) {
    console.warn(
      informAboutProtectedRouteInfo(
        path,
        !!options.publicRoutes,
        !!options.ignoredRoutes,
        isApiRoute,
        DEFAULT_IGNORED_ROUTES
      )
    );
  }
};
export {
  DEFAULT_API_ROUTES,
  DEFAULT_CONFIG_MATCHER,
  DEFAULT_IGNORED_ROUTES,
  authMiddleware
};
//# sourceMappingURL=authMiddleware.js.map