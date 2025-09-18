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
var buildClerkProps_exports = {};
__export(buildClerkProps_exports, {
  buildClerkProps: () => buildClerkProps
});
module.exports = __toCommonJS(buildClerkProps_exports);
var import_internal = require("@clerk/backend/internal");
var import_jwt = require("@clerk/backend/jwt");
var import_constants = require("./constants");
var import_utils = require("./utils");
const buildClerkProps = (req, initState = {}) => {
  const authStatus = (0, import_utils.getAuthKeyFromRequest)(req, "AuthStatus");
  const authToken = (0, import_utils.getAuthKeyFromRequest)(req, "AuthToken");
  const authMessage = (0, import_utils.getAuthKeyFromRequest)(req, "AuthMessage");
  const authReason = (0, import_utils.getAuthKeyFromRequest)(req, "AuthReason");
  const encryptedRequestData = (0, import_utils.getHeader)(req, import_internal.constants.Headers.ClerkRequestData);
  const decryptedRequestData = (0, import_utils.decryptClerkRequestData)(encryptedRequestData);
  const options = {
    secretKey: decryptedRequestData.secretKey || import_constants.SECRET_KEY,
    apiUrl: import_constants.API_URL,
    apiVersion: import_constants.API_VERSION,
    authStatus,
    authMessage,
    authReason
  };
  let authObject;
  if (!authStatus || authStatus !== import_internal.AuthStatus.SignedIn) {
    authObject = (0, import_internal.signedOutAuthObject)(options);
  } else {
    const jwt = (0, import_jwt.decodeJwt)(authToken);
    authObject = (0, import_internal.signedInAuthObject)(options, jwt.raw.text, jwt.payload);
  }
  const sanitizedAuthObject = (0, import_internal.makeAuthObjectSerializable)((0, import_internal.stripPrivateDataFromObject)({ ...authObject, ...initState }));
  return (0, import_utils.injectSSRStateIntoObject)({}, sanitizedAuthObject);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildClerkProps
});
//# sourceMappingURL=buildClerkProps.js.map