"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  apiEndpointUnauthorizedNextResponse: () => apiEndpointUnauthorizedNextResponse,
  assertKey: () => assertKey,
  assertTokenSignature: () => assertTokenSignature,
  decorateRequest: () => decorateRequest,
  decryptClerkRequestData: () => decryptClerkRequestData,
  encryptClerkRequestData: () => encryptClerkRequestData,
  getAuthKeyFromRequest: () => getAuthKeyFromRequest,
  getCookie: () => getCookie,
  getCustomAttributeFromRequest: () => getCustomAttributeFromRequest,
  getHeader: () => getHeader,
  handleMultiDomainAndProxy: () => handleMultiDomainAndProxy,
  injectSSRStateIntoObject: () => injectSSRStateIntoObject,
  redirectAdapter: () => redirectAdapter,
  setRequestHeadersOnNextResponse: () => setRequestHeadersOnNextResponse
});
module.exports = __toCommonJS(utils_exports);
var import_internal = require("@clerk/backend/internal");
var import_handleValueOrFn = require("@clerk/shared/handleValueOrFn");
var import_keys = require("@clerk/shared/keys");
var import_logger = require("@clerk/shared/logger");
var import_proxy = require("@clerk/shared/proxy");
var import_aes = __toESM(require("crypto-js/aes"));
var import_enc_utf8 = __toESM(require("crypto-js/enc-utf8"));
var import_hmac_sha1 = __toESM(require("crypto-js/hmac-sha1"));
var import_server = require("next/server");
var import_constants = require("../constants");
var import_constants2 = require("./constants");
var import_errors = require("./errors");
var import_errorThrower = require("./errorThrower");
function getCustomAttributeFromRequest(req, key) {
  return key in req ? req[key] : void 0;
}
function getAuthKeyFromRequest(req, key) {
  return getCustomAttributeFromRequest(req, import_internal.constants.Attributes[key]) || getHeader(req, import_internal.constants.Headers[key]);
}
function getHeader(req, name) {
  var _a, _b;
  if (isNextRequest(req)) {
    return req.headers.get(name);
  }
  return req.headers[name] || req.headers[name.toLowerCase()] || ((_b = (_a = req.socket) == null ? void 0 : _a._httpMessage) == null ? void 0 : _b.getHeader(name));
}
function getCookie(req, name) {
  if (isNextRequest(req)) {
    const reqCookieOrString = req.cookies.get(name);
    if (!reqCookieOrString) {
      return void 0;
    }
    return typeof reqCookieOrString === "string" ? reqCookieOrString : reqCookieOrString.value;
  }
  return req.cookies[name];
}
function isNextRequest(val) {
  try {
    const { headers, nextUrl, cookies } = val || {};
    return typeof (headers == null ? void 0 : headers.get) === "function" && typeof (nextUrl == null ? void 0 : nextUrl.searchParams.get) === "function" && typeof (cookies == null ? void 0 : cookies.get) === "function";
  } catch (e) {
    return false;
  }
}
const OVERRIDE_HEADERS = "x-middleware-override-headers";
const MIDDLEWARE_HEADER_PREFIX = "x-middleware-request";
const setRequestHeadersOnNextResponse = (res, req, newHeaders) => {
  if (!res.headers.get(OVERRIDE_HEADERS)) {
    res.headers.set(OVERRIDE_HEADERS, [...req.headers.keys()]);
    req.headers.forEach((val, key) => {
      res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
    });
  }
  Object.entries(newHeaders).forEach(([key, val]) => {
    res.headers.set(OVERRIDE_HEADERS, `${res.headers.get(OVERRIDE_HEADERS)},${key}`);
    res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
  });
};
const injectSSRStateIntoObject = (obj, authObject) => {
  const __clerk_ssr_state = process.env.NODE_ENV !== "production" ? JSON.parse(JSON.stringify({ ...authObject })) : { ...authObject };
  return { ...obj, __clerk_ssr_state };
};
function decorateRequest(req, res, requestState, requestData) {
  var _a;
  const { reason, message, status, token } = requestState;
  if (!res) {
    res = import_server.NextResponse.next();
  }
  if (res.headers.get(import_constants.constants.Headers.NextRedirect)) {
    return res;
  }
  let rewriteURL;
  if (res.headers.get(import_constants.constants.Headers.NextResume) === "1") {
    res.headers.delete(import_constants.constants.Headers.NextResume);
    rewriteURL = new URL(req.url);
  }
  const rewriteURLHeader = res.headers.get(import_constants.constants.Headers.NextRewrite);
  if (rewriteURLHeader) {
    const reqURL = new URL(req.url);
    rewriteURL = new URL(rewriteURLHeader);
    if (rewriteURL.origin !== reqURL.origin) {
      return res;
    }
  }
  if (rewriteURL) {
    const clerkRequestData = encryptClerkRequestData(requestData);
    setRequestHeadersOnNextResponse(res, req, {
      [import_internal.constants.Headers.AuthStatus]: status,
      [import_internal.constants.Headers.AuthToken]: token || "",
      [import_internal.constants.Headers.AuthSignature]: token ? createTokenSignature(token, (_a = requestData == null ? void 0 : requestData.secretKey) != null ? _a : import_constants2.SECRET_KEY) : "",
      [import_internal.constants.Headers.AuthMessage]: message || "",
      [import_internal.constants.Headers.AuthReason]: reason || "",
      [import_internal.constants.Headers.ClerkUrl]: req.clerkUrl.toString(),
      ...clerkRequestData ? { [import_internal.constants.Headers.ClerkRequestData]: clerkRequestData } : {}
    });
    res.headers.set(import_constants.constants.Headers.NextRewrite, rewriteURL.href);
  }
  return res;
}
const apiEndpointUnauthorizedNextResponse = () => {
  return import_server.NextResponse.json(null, { status: 401, statusText: "Unauthorized" });
};
const handleMultiDomainAndProxy = (clerkRequest, opts) => {
  const relativeOrAbsoluteProxyUrl = (0, import_handleValueOrFn.handleValueOrFn)(opts == null ? void 0 : opts.proxyUrl, clerkRequest.clerkUrl, import_constants2.PROXY_URL);
  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !(0, import_proxy.isHttpOrHttps)(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }
  const isSatellite = (0, import_handleValueOrFn.handleValueOrFn)(opts.isSatellite, new URL(clerkRequest.url), import_constants2.IS_SATELLITE);
  const domain = (0, import_handleValueOrFn.handleValueOrFn)(opts.domain, new URL(clerkRequest.url), import_constants2.DOMAIN);
  const signInUrl = (opts == null ? void 0 : opts.signInUrl) || import_constants2.SIGN_IN_URL;
  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(import_errors.missingDomainAndProxy);
  }
  if (isSatellite && !(0, import_proxy.isHttpOrHttps)(signInUrl) && (0, import_keys.isDevelopmentFromSecretKey)(opts.secretKey || import_constants2.SECRET_KEY)) {
    throw new Error(import_errors.missingSignInUrlInDev);
  }
  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl
  };
};
const redirectAdapter = (url) => {
  return import_server.NextResponse.redirect(url, { headers: { [import_internal.constants.Headers.ClerkRedirectTo]: "true" } });
};
function assertKey(key, onError) {
  if (!key) {
    onError();
  }
  return key;
}
function createTokenSignature(token, key) {
  return (0, import_hmac_sha1.default)(token, key).toString();
}
function assertTokenSignature(token, key, signature) {
  if (!signature) {
    throw new Error(import_errors.authSignatureInvalid);
  }
  const expectedSignature = createTokenSignature(token, key);
  if (expectedSignature !== signature) {
    throw new Error(import_errors.authSignatureInvalid);
  }
}
function encryptClerkRequestData(requestData) {
  if (!requestData || !Object.values(requestData).length) {
    return;
  }
  if (requestData.secretKey && !import_constants2.ENCRYPTION_KEY) {
    import_logger.logger.warnOnce(
      "Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys"
    );
    return;
  }
  return import_aes.default.encrypt(
    JSON.stringify(requestData),
    import_constants2.ENCRYPTION_KEY || assertKey(import_constants2.SECRET_KEY, () => import_errorThrower.errorThrower.throwMissingSecretKeyError())
  ).toString();
}
function decryptClerkRequestData(encryptedRequestData) {
  if (!encryptedRequestData) {
    return {};
  }
  try {
    const decryptedBytes = import_aes.default.decrypt(encryptedRequestData, import_constants2.ENCRYPTION_KEY || import_constants2.SECRET_KEY);
    const encoded = decryptedBytes.toString(import_enc_utf8.default);
    return JSON.parse(encoded);
  } catch (err) {
    throw new Error(import_errors.encryptionKeyInvalid);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apiEndpointUnauthorizedNextResponse,
  assertKey,
  assertTokenSignature,
  decorateRequest,
  decryptClerkRequestData,
  encryptClerkRequestData,
  getAuthKeyFromRequest,
  getCookie,
  getCustomAttributeFromRequest,
  getHeader,
  handleMultiDomainAndProxy,
  injectSSRStateIntoObject,
  redirectAdapter,
  setRequestHeadersOnNextResponse
});
//# sourceMappingURL=utils.js.map