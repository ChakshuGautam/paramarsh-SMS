import { createClerkClient } from "@clerk/backend";
import { constants } from "@clerk/backend/internal";
import { deprecated } from "@clerk/shared/deprecated";
import { buildRequestLike, isPrerenderingBailout } from "../app-router/server/utils";
import { clerkMiddlewareRequestDataStorage } from "./clerkMiddleware";
import {
  API_URL,
  API_VERSION,
  DOMAIN,
  IS_SATELLITE,
  PROXY_URL,
  PUBLISHABLE_KEY,
  SDK_METADATA,
  SECRET_KEY,
  TELEMETRY_DEBUG,
  TELEMETRY_DISABLED
} from "./constants";
import { decryptClerkRequestData, getHeader } from "./utils";
const clerkClientDefaultOptions = {
  secretKey: SECRET_KEY,
  publishableKey: PUBLISHABLE_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: `${"@clerk/nextjs"}@${"5.7.5"}`,
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
  sdkMetadata: SDK_METADATA,
  telemetry: {
    disabled: TELEMETRY_DISABLED,
    debug: TELEMETRY_DEBUG
  }
};
const createClerkClientWithOptions = (options) => createClerkClient({ ...clerkClientDefaultOptions, ...options });
const clerkClientSingleton = createClerkClient(clerkClientDefaultOptions);
const clerkClientForRequest = () => {
  var _a, _b;
  let requestData;
  try {
    const request = buildRequestLike();
    const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
    requestData = decryptClerkRequestData(encryptedRequestData);
  } catch (err) {
    if (err && isPrerenderingBailout(err)) {
      throw err;
    }
  }
  const options = (_b = (_a = clerkMiddlewareRequestDataStorage.getStore()) == null ? void 0 : _a.get("requestData")) != null ? _b : requestData;
  if ((options == null ? void 0 : options.secretKey) || (options == null ? void 0 : options.publishableKey)) {
    return createClerkClientWithOptions(options);
  }
  return clerkClientSingleton;
};
const clerkClient = new Proxy(Object.assign(clerkClientForRequest, clerkClientSingleton), {
  get(target, prop, receiver) {
    deprecated("clerkClient singleton", "Use `clerkClient()` as a function instead.");
    return Reflect.get(target, prop, receiver);
  }
});
export {
  clerkClient
};
//# sourceMappingURL=clerkClient.js.map