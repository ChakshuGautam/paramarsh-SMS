import { constants } from "@clerk/backend/internal";
import { handleValueOrFn } from "@clerk/shared/handleValueOrFn";
import { isDevelopmentFromSecretKey } from "@clerk/shared/keys";
import { logger } from "@clerk/shared/logger";
import { isHttpOrHttps } from "@clerk/shared/proxy";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import hmacSHA1 from "crypto-js/hmac-sha1";
import { NextResponse } from "next/server";
import { constants as nextConstants } from "../constants";
import { DOMAIN, ENCRYPTION_KEY, IS_SATELLITE, PROXY_URL, SECRET_KEY, SIGN_IN_URL } from "./constants";
import { authSignatureInvalid, encryptionKeyInvalid, missingDomainAndProxy, missingSignInUrlInDev } from "./errors";
import { errorThrower } from "./errorThrower";
function getCustomAttributeFromRequest(req, key) {
  return key in req ? req[key] : void 0;
}
function getAuthKeyFromRequest(req, key) {
  return getCustomAttributeFromRequest(req, constants.Attributes[key]) || getHeader(req, constants.Headers[key]);
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
    res = NextResponse.next();
  }
  if (res.headers.get(nextConstants.Headers.NextRedirect)) {
    return res;
  }
  let rewriteURL;
  if (res.headers.get(nextConstants.Headers.NextResume) === "1") {
    res.headers.delete(nextConstants.Headers.NextResume);
    rewriteURL = new URL(req.url);
  }
  const rewriteURLHeader = res.headers.get(nextConstants.Headers.NextRewrite);
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
      [constants.Headers.AuthStatus]: status,
      [constants.Headers.AuthToken]: token || "",
      [constants.Headers.AuthSignature]: token ? createTokenSignature(token, (_a = requestData == null ? void 0 : requestData.secretKey) != null ? _a : SECRET_KEY) : "",
      [constants.Headers.AuthMessage]: message || "",
      [constants.Headers.AuthReason]: reason || "",
      [constants.Headers.ClerkUrl]: req.clerkUrl.toString(),
      ...clerkRequestData ? { [constants.Headers.ClerkRequestData]: clerkRequestData } : {}
    });
    res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  }
  return res;
}
const apiEndpointUnauthorizedNextResponse = () => {
  return NextResponse.json(null, { status: 401, statusText: "Unauthorized" });
};
const handleMultiDomainAndProxy = (clerkRequest, opts) => {
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts == null ? void 0 : opts.proxyUrl, clerkRequest.clerkUrl, PROXY_URL);
  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }
  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(clerkRequest.url), IS_SATELLITE);
  const domain = handleValueOrFn(opts.domain, new URL(clerkRequest.url), DOMAIN);
  const signInUrl = (opts == null ? void 0 : opts.signInUrl) || SIGN_IN_URL;
  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }
  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(opts.secretKey || SECRET_KEY)) {
    throw new Error(missingSignInUrlInDev);
  }
  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl
  };
};
const redirectAdapter = (url) => {
  return NextResponse.redirect(url, { headers: { [constants.Headers.ClerkRedirectTo]: "true" } });
};
function assertKey(key, onError) {
  if (!key) {
    onError();
  }
  return key;
}
function createTokenSignature(token, key) {
  return hmacSHA1(token, key).toString();
}
function assertTokenSignature(token, key, signature) {
  if (!signature) {
    throw new Error(authSignatureInvalid);
  }
  const expectedSignature = createTokenSignature(token, key);
  if (expectedSignature !== signature) {
    throw new Error(authSignatureInvalid);
  }
}
function encryptClerkRequestData(requestData) {
  if (!requestData || !Object.values(requestData).length) {
    return;
  }
  if (requestData.secretKey && !ENCRYPTION_KEY) {
    logger.warnOnce(
      "Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys"
    );
    return;
  }
  return AES.encrypt(
    JSON.stringify(requestData),
    ENCRYPTION_KEY || assertKey(SECRET_KEY, () => errorThrower.throwMissingSecretKeyError())
  ).toString();
}
function decryptClerkRequestData(encryptedRequestData) {
  if (!encryptedRequestData) {
    return {};
  }
  try {
    const decryptedBytes = AES.decrypt(encryptedRequestData, ENCRYPTION_KEY || SECRET_KEY);
    const encoded = decryptedBytes.toString(encUtf8);
    return JSON.parse(encoded);
  } catch (err) {
    throw new Error(encryptionKeyInvalid);
  }
}
export {
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
};
//# sourceMappingURL=utils.js.map