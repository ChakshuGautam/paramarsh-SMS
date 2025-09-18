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
var clerkMiddleware_exports = {};
__export(clerkMiddleware_exports, {
  clerkMiddleware: () => clerkMiddleware,
  clerkMiddlewareRequestDataStorage: () => clerkMiddlewareRequestDataStorage,
  createAuthenticateRequestOptions: () => createAuthenticateRequestOptions
});
module.exports = __toCommonJS(clerkMiddleware_exports);
var import_node_async_hooks = require("node:async_hooks");
var import_internal = require("@clerk/backend/internal");
var import_telemetry = require("@clerk/shared/telemetry");
var import_server = require("next/server");
var import_utils = require("../utils");
var import_debugLogger = require("../utils/debugLogger");
var import_clerkClient = require("./clerkClient");
var import_constants = require("./constants");
var import_errorThrower = require("./errorThrower");
var import_protect = require("./protect");
var import_utils2 = require("./utils");
const CONTROL_FLOW_ERROR = {
  FORCE_NOT_FOUND: "CLERK_PROTECT_REWRITE",
  REDIRECT_TO_URL: "CLERK_PROTECT_REDIRECT_TO_URL",
  REDIRECT_TO_SIGN_IN: "CLERK_PROTECT_REDIRECT_TO_SIGN_IN"
};
const clerkMiddlewareRequestDataStore = /* @__PURE__ */ new Map();
const clerkMiddlewareRequestDataStorage = new import_node_async_hooks.AsyncLocalStorage();
const clerkMiddleware = (...args) => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);
  return clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const nextMiddleware = (0, import_debugLogger.withLogger)("clerkMiddleware", (logger) => async (request2, event2) => {
      const resolvedParams = typeof params === "function" ? params(request2) : params;
      const publishableKey = (0, import_utils2.assertKey)(
        resolvedParams.publishableKey || import_constants.PUBLISHABLE_KEY,
        () => import_errorThrower.errorThrower.throwMissingPublishableKeyError()
      );
      const secretKey = (0, import_utils2.assertKey)(
        resolvedParams.secretKey || import_constants.SECRET_KEY,
        () => import_errorThrower.errorThrower.throwMissingSecretKeyError()
      );
      const signInUrl = resolvedParams.signInUrl || import_constants.SIGN_IN_URL;
      const signUpUrl = resolvedParams.signUpUrl || import_constants.SIGN_UP_URL;
      const options = {
        publishableKey,
        secretKey,
        signInUrl,
        signUpUrl,
        ...resolvedParams
      };
      clerkMiddlewareRequestDataStore.set("requestData", options);
      (0, import_clerkClient.clerkClient)().telemetry.record(
        (0, import_telemetry.eventMethodCalled)("clerkMiddleware", {
          handler: Boolean(handler),
          satellite: Boolean(options.isSatellite),
          proxy: Boolean(options.proxyUrl)
        })
      );
      if (options.debug) {
        logger.enable();
      }
      const clerkRequest = (0, import_internal.createClerkRequest)(request2);
      logger.debug("options", options);
      logger.debug("url", () => clerkRequest.toJSON());
      const requestState = await (0, import_clerkClient.clerkClient)().authenticateRequest(
        clerkRequest,
        createAuthenticateRequestOptions(clerkRequest, options)
      );
      logger.debug("requestState", () => ({
        status: requestState.status,
        headers: JSON.stringify(Object.fromEntries(requestState.headers)),
        reason: requestState.reason
      }));
      const locationHeader = requestState.headers.get(import_internal.constants.Headers.Location);
      if (locationHeader) {
        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === import_internal.AuthStatus.Handshake) {
        throw new Error("Clerk: handshake status without redirect");
      }
      const authObject = requestState.toAuth();
      logger.debug("auth", () => ({ auth: authObject, debug: authObject.debug() }));
      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);
      const authObjWithMethods = Object.assign(authObject, { protect, redirectToSignIn });
      let handlerResult = import_server.NextResponse.next();
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
      if ((0, import_utils.isRedirect)(handlerResult)) {
        logger.debug("handlerResult is redirect");
        return (0, import_utils.serverRedirectWithAuth)(clerkRequest, handlerResult, options);
      }
      if (options.debug) {
        (0, import_utils2.setRequestHeadersOnNextResponse)(handlerResult, clerkRequest, { [import_internal.constants.Headers.EnableDebug]: "true" });
      }
      (0, import_utils2.decorateRequest)(clerkRequest, handlerResult, requestState, resolvedParams);
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
    ...(0, import_utils2.handleMultiDomainAndProxy)(clerkRequest, options)
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
    return (0, import_protect.createProtect)({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  };
};
const handleControlFlowErrors = (e, clerkRequest, requestState) => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.FORCE_NOT_FOUND:
      return (0, import_utils.setHeader)(
        import_server.NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
        import_internal.constants.Headers.AuthReason,
        "protect-rewrite"
      );
    case CONTROL_FLOW_ERROR.REDIRECT_TO_URL:
      return (0, import_utils2.redirectAdapter)(e.redirectUrl);
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return (0, import_internal.createRedirect)({
        redirectAdapter: import_utils2.redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        publishableKey: requestState.publishableKey
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clerkMiddleware,
  clerkMiddlewareRequestDataStorage,
  createAuthenticateRequestOptions
});
//# sourceMappingURL=clerkMiddleware.js.map