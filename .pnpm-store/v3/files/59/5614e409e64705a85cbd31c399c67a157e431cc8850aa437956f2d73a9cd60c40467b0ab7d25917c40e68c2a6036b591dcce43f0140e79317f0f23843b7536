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
var redirectHelpers_exports = {};
__export(redirectHelpers_exports, {
  redirectToSignIn: () => redirectToSignIn,
  redirectToSignUp: () => redirectToSignUp
});
module.exports = __toCommonJS(redirectHelpers_exports);
var import_internal = require("@clerk/backend/internal");
var import_server = require("next/server");
var import_utils = require("../utils");
var import_constants = require("./constants");
const redirectAdapter = (url) => {
  const res = import_server.NextResponse.redirect(url);
  return (0, import_utils.setHeader)(res, import_internal.constants.Headers.ClerkRedirectTo, "true");
};
const redirectHelpers = (0, import_internal.createRedirect)({
  redirectAdapter,
  signInUrl: import_constants.SIGN_IN_URL,
  signUpUrl: import_constants.SIGN_UP_URL,
  publishableKey: import_constants.PUBLISHABLE_KEY,
  // We're setting baseUrl to '' here as we want to keep the legacy behavior of
  // the redirectToSignIn, redirectToSignUp helpers in the backend package.
  baseUrl: ""
});
const redirectToSignIn = redirectHelpers.redirectToSignIn;
const redirectToSignUp = redirectHelpers.redirectToSignUp;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  redirectToSignIn,
  redirectToSignUp
});
//# sourceMappingURL=redirectHelpers.js.map