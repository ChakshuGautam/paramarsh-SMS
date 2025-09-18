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
var clerkClient_exports = {};
__export(clerkClient_exports, {
  clerkClient: () => clerkClient
});
module.exports = __toCommonJS(clerkClient_exports);
var import_backend = require("@clerk/backend");
var import_internal = require("@clerk/backend/internal");
var import_deprecated = require("@clerk/shared/deprecated");
var import_utils = require("../app-router/server/utils");
var import_clerkMiddleware = require("./clerkMiddleware");
var import_constants = require("./constants");
var import_utils2 = require("./utils");
const clerkClientDefaultOptions = {
  secretKey: import_constants.SECRET_KEY,
  publishableKey: import_constants.PUBLISHABLE_KEY,
  apiUrl: import_constants.API_URL,
  apiVersion: import_constants.API_VERSION,
  userAgent: `${"@clerk/nextjs"}@${"5.7.5"}`,
  proxyUrl: import_constants.PROXY_URL,
  domain: import_constants.DOMAIN,
  isSatellite: import_constants.IS_SATELLITE,
  sdkMetadata: import_constants.SDK_METADATA,
  telemetry: {
    disabled: import_constants.TELEMETRY_DISABLED,
    debug: import_constants.TELEMETRY_DEBUG
  }
};
const createClerkClientWithOptions = (options) => (0, import_backend.createClerkClient)({ ...clerkClientDefaultOptions, ...options });
const clerkClientSingleton = (0, import_backend.createClerkClient)(clerkClientDefaultOptions);
const clerkClientForRequest = () => {
  var _a, _b;
  let requestData;
  try {
    const request = (0, import_utils.buildRequestLike)();
    const encryptedRequestData = (0, import_utils2.getHeader)(request, import_internal.constants.Headers.ClerkRequestData);
    requestData = (0, import_utils2.decryptClerkRequestData)(encryptedRequestData);
  } catch (err) {
    if (err && (0, import_utils.isPrerenderingBailout)(err)) {
      throw err;
    }
  }
  const options = (_b = (_a = import_clerkMiddleware.clerkMiddlewareRequestDataStorage.getStore()) == null ? void 0 : _a.get("requestData")) != null ? _b : requestData;
  if ((options == null ? void 0 : options.secretKey) || (options == null ? void 0 : options.publishableKey)) {
    return createClerkClientWithOptions(options);
  }
  return clerkClientSingleton;
};
const clerkClient = new Proxy(Object.assign(clerkClientForRequest, clerkClientSingleton), {
  get(target, prop, receiver) {
    (0, import_deprecated.deprecated)("clerkClient singleton", "Use `clerkClient()` as a function instead.");
    return Reflect.get(target, prop, receiver);
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clerkClient
});
//# sourceMappingURL=clerkClient.js.map