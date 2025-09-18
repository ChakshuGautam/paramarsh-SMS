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
var auth_exports = {};
__export(auth_exports, {
  auth: () => auth,
  initialState: () => initialState
});
module.exports = __toCommonJS(auth_exports);
var import_internal = require("@clerk/backend/internal");
var import_navigation = require("next/navigation");
var import_buildClerkProps = require("../../server/buildClerkProps");
var import_constants = require("../../server/constants");
var import_createGetAuth = require("../../server/createGetAuth");
var import_errors = require("../../server/errors");
var import_protect = require("../../server/protect");
var import_utils = require("../../server/utils");
var import_utils2 = require("./utils");
const auth = () => {
  require("server-only");
  const request = (0, import_utils2.buildRequestLike)();
  const authObject = (0, import_createGetAuth.createGetAuth)({
    debugLoggerName: "auth()",
    noAuthStatusMessage: (0, import_errors.authAuthHeaderMissing)()
  })(request);
  const clerkUrl = (0, import_utils.getAuthKeyFromRequest)(request, "ClerkUrl");
  const redirectToSignIn = (opts = {}) => {
    const clerkRequest = (0, import_internal.createClerkRequest)(request);
    const devBrowserToken = clerkRequest.clerkUrl.searchParams.get(import_internal.constants.QueryParameters.DevBrowser) || clerkRequest.cookies.get(import_internal.constants.Cookies.DevBrowser);
    const encryptedRequestData = (0, import_utils.getHeader)(request, import_internal.constants.Headers.ClerkRequestData);
    const decryptedRequestData = (0, import_utils.decryptClerkRequestData)(encryptedRequestData);
    return (0, import_internal.createRedirect)({
      redirectAdapter: import_navigation.redirect,
      devBrowserToken,
      baseUrl: clerkRequest.clerkUrl.toString(),
      publishableKey: decryptedRequestData.publishableKey || import_constants.PUBLISHABLE_KEY,
      signInUrl: decryptedRequestData.signInUrl || import_constants.SIGN_IN_URL,
      signUpUrl: decryptedRequestData.signUpUrl || import_constants.SIGN_UP_URL
    }).redirectToSignIn({
      returnBackUrl: opts.returnBackUrl === null ? "" : opts.returnBackUrl || (clerkUrl == null ? void 0 : clerkUrl.toString())
    });
  };
  const protect = (0, import_protect.createProtect)({ request, authObject, redirectToSignIn, notFound: import_navigation.notFound, redirect: import_navigation.redirect });
  return Object.assign(authObject, { protect, redirectToSignIn });
};
const initialState = () => {
  return (0, import_buildClerkProps.buildClerkProps)((0, import_utils2.buildRequestLike)());
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  auth,
  initialState
});
//# sourceMappingURL=auth.js.map