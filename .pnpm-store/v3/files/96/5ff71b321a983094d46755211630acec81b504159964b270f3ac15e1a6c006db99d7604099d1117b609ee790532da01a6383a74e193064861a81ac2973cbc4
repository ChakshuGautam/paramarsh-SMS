"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var authMiddleware_exports = {};
__export(authMiddleware_exports, {
  DEFAULT_API_ROUTES: () => DEFAULT_API_ROUTES,
  DEFAULT_CONFIG_MATCHER: () => DEFAULT_CONFIG_MATCHER,
  DEFAULT_IGNORED_ROUTES: () => DEFAULT_IGNORED_ROUTES,
  authMiddleware: () => authMiddleware
});
module.exports = __toCommonJS(authMiddleware_exports);
var import_internal = require("@clerk/backend/internal");
var import_keys = require("@clerk/shared/keys");
var import_telemetry = require("@clerk/shared/telemetry");
var import_server = require("next/server");
var import_utils = require("../utils");
var import_debugLogger = require("../utils/debugLogger");
var import_clerkClient = require("./clerkClient");
var import_clerkMiddleware = require("./clerkMiddleware");
var import_constants = require("./constants");
var import_errors = require("./errors");
var import_errorThrower = require("./errorThrower");
var import_routeMatcher = require("./routeMatcher");
var import_utils2 = require("./utils");
const DEFAULT_CONFIG_MATCHER = ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"];
const DEFAULT_IGNORED_ROUTES = [`/((?!api|trpc))(_next.*|.+\\.[\\w]+$)`];
const DEFAULT_API_ROUTES = ["/api/(.*)", "/trpc/(.*)"];
const authMiddleware = (...args) => {
  const [params = {}] = args;
  const publishableKey = (0, import_utils2.assertKey)(
    params.publishableKey || import_constants.PUBLISHABLE_KEY,
    () => import_errorThrower.errorThrower.throwMissingPublishableKeyError()
  );
  const secretKey = (0, import_utils2.assertKey)(params.secretKey || import_constants.SECRET_KEY, () => import_errorThrower.errorThrower.throwMissingPublishableKeyError());
  const signInUrl = params.signInUrl || import_constants.SIGN_IN_URL;
  const signUpUrl = params.signUpUrl || import_constants.SIGN_UP_URL;
  const options = { ...params, publishableKey, secretKey, signInUrl, signUpUrl };
  const isIgnoredRoute = (0, import_routeMatcher.createRouteMatcher)(options.ignoredRoutes || DEFAULT_IGNORED_ROUTES);
  const isPublicRoute = (0, import_routeMatcher.createRouteMatcher)(withDefaultPublicRoutes(options.publicRoutes));
  const isApiRoute = createApiRoutes(options.apiRoutes);
  const defaultAfterAuth = createDefaultAfterAuth(isPublicRoute, isApiRoute, options);
  import_clerkClient.clerkClient.telemetry.record(
    (0, import_telemetry.eventMethodCalled)("authMiddleware", {
      publicRoutes: Boolean(options.publicRoutes),
      ignoredRoutes: Boolean(options.ignoredRoutes),
      beforeAuth: Boolean(options.beforeAuth),
      afterAuth: Boolean(options.afterAuth)
    })
  );
  return (0, import_debugLogger.withLogger)("authMiddleware", (logger) => async (_req, evt) => {
    if (options.debug) {
      logger.enable();
    }
    const clerkRequest = (0, import_internal.createClerkRequest)(_req);
    const nextRequest = withNormalizedClerkUrl(clerkRequest, _req);
    logger.debug("URL debug", {
      url: nextRequest.nextUrl.href,
      method: nextRequest.method,
      headers: (0, import_utils.stringifyHeaders)(nextRequest.headers),
      nextUrl: nextRequest.nextUrl.href,
      clerkUrl: nextRequest.experimental_clerkUrl.href
    });
    logger.debug("Options debug", { ...options, beforeAuth: !!options.beforeAuth, afterAuth: !!options.afterAuth });
    if (isIgnoredRoute(nextRequest)) {
      logger.debug({ isIgnoredRoute: true });
      if ((0, import_keys.isDevelopmentFromSecretKey)(options.secretKey) && !options.ignoredRoutes) {
        console.warn(
          (0, import_errors.receivedRequestForIgnoredRoute)(
            nextRequest.experimental_clerkUrl.href,
            JSON.stringify(DEFAULT_CONFIG_MATCHER)
          )
        );
      }
      return (0, import_utils.setHeader)(import_server.NextResponse.next(), import_internal.constants.Headers.AuthReason, "ignored-route");
    }
    const beforeAuthRes = await (options.beforeAuth && options.beforeAuth(nextRequest, evt));
    if (beforeAuthRes === false) {
      logger.debug("Before auth returned false, skipping");
      return (0, import_utils.setHeader)(import_server.NextResponse.next(), import_internal.constants.Headers.AuthReason, "skip");
    } else if (beforeAuthRes && (0, import_utils.isRedirect)(beforeAuthRes)) {
      logger.debug("Before auth returned redirect, following redirect");
      return (0, import_utils.setHeader)(beforeAuthRes, import_internal.constants.Headers.AuthReason, "before-auth-redirect");
    }
    const requestState = await import_clerkClient.clerkClient.authenticateRequest(
      clerkRequest,
      (0, import_clerkMiddleware.createAuthenticateRequestOptions)(clerkRequest, options)
    );
    const locationHeader = requestState.headers.get("location");
    if (locationHeader) {
      return new Response(null, { status: 307, headers: requestState.headers });
    }
    if (requestState.status === import_internal.AuthStatus.Handshake) {
      throw new Error("Clerk: unexpected handshake without redirect");
    }
    const auth = Object.assign(requestState.toAuth(), {
      isPublicRoute: isPublicRoute(nextRequest),
      isApiRoute: isApiRoute(nextRequest)
    });
    logger.debug(() => ({ auth: JSON.stringify(auth), debug: auth.debug() }));
    const afterAuthRes = await (options.afterAuth || defaultAfterAuth)(auth, nextRequest, evt);
    const finalRes = (0, import_utils.mergeResponses)(beforeAuthRes, afterAuthRes) || import_server.NextResponse.next();
    logger.debug(() => ({ mergedHeaders: (0, import_utils.stringifyHeaders)(finalRes.headers) }));
    if ((0, import_utils.isRedirect)(finalRes)) {
      logger.debug("Final response is redirect, following redirect");
      return (0, import_utils.serverRedirectWithAuth)(clerkRequest, finalRes, options);
    }
    if (options.debug) {
      (0, import_utils2.setRequestHeadersOnNextResponse)(finalRes, nextRequest, { [import_internal.constants.Headers.EnableDebug]: "true" });
      logger.debug(`Added ${import_internal.constants.Headers.EnableDebug} on request`);
    }
    const result = (0, import_utils2.decorateRequest)(clerkRequest, finalRes, requestState, { secretKey }) || import_server.NextResponse.next();
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
        return (0, import_utils2.apiEndpointUnauthorizedNextResponse)();
      } else {
        informAboutProtectedRoute(req.experimental_clerkUrl.pathname, options, false);
      }
      return (0, import_internal.createRedirect)({
        redirectAdapter: import_utils2.redirectAdapter,
        signInUrl: options.signInUrl,
        signUpUrl: options.signUpUrl,
        publishableKey: options.publishableKey,
        // We're setting baseUrl to '' here as we want to keep the legacy behavior of
        // the redirectToSignIn, redirectToSignUp helpers in the backend package.
        baseUrl: ""
      }).redirectToSignIn({ returnBackUrl: req.experimental_clerkUrl.href });
    }
    return import_server.NextResponse.next();
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
    return (0, import_routeMatcher.createRouteMatcher)(apiRoutes);
  }
  const isDefaultApiRoute = (0, import_routeMatcher.createRouteMatcher)(DEFAULT_API_ROUTES);
  return (req) => isDefaultApiRoute(req) || isRequestMethodIndicatingApiRoute(req) || isRequestContentTypeJson(req);
};
const isRequestContentTypeJson = (req) => {
  const requestContentType = req.headers.get(import_internal.constants.Headers.ContentType);
  return requestContentType === import_internal.constants.ContentTypes.Json;
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
  if (options.debug || (0, import_keys.isDevelopmentFromSecretKey)(options.secretKey)) {
    console.warn(
      (0, import_errors.informAboutProtectedRouteInfo)(
        path,
        !!options.publicRoutes,
        !!options.ignoredRoutes,
        isApiRoute,
        DEFAULT_IGNORED_ROUTES
      )
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_API_ROUTES,
  DEFAULT_CONFIG_MATCHER,
  DEFAULT_IGNORED_ROUTES,
  authMiddleware
});
//# sourceMappingURL=authMiddleware.js.map