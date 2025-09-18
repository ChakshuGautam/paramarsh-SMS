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
var createGetAuth_exports = {};
__export(createGetAuth_exports, {
  createGetAuth: () => createGetAuth,
  getAuth: () => getAuth,
  parseJwt: () => parseJwt
});
module.exports = __toCommonJS(createGetAuth_exports);
var import_internal = require("@clerk/backend/internal");
var import_jwt = require("@clerk/backend/jwt");
var import_debugLogger = require("../utils/debugLogger");
var import_constants = require("./constants");
var import_errors = require("./errors");
var import_utils = require("./utils");
const createGetAuth = ({
  noAuthStatusMessage,
  debugLoggerName
}) => (0, import_debugLogger.withLogger)(debugLoggerName, (logger) => {
  return (req, opts) => {
    if ((0, import_utils.getHeader)(req, import_internal.constants.Headers.EnableDebug) === "true") {
      logger.enable();
    }
    const authToken = (0, import_utils.getAuthKeyFromRequest)(req, "AuthToken");
    const authSignature = (0, import_utils.getAuthKeyFromRequest)(req, "AuthSignature");
    const authMessage = (0, import_utils.getAuthKeyFromRequest)(req, "AuthMessage");
    const authReason = (0, import_utils.getAuthKeyFromRequest)(req, "AuthReason");
    const authStatus = (0, import_utils.getAuthKeyFromRequest)(req, "AuthStatus");
    logger.debug("Headers debug", { authStatus, authMessage, authReason });
    if (!authStatus) {
      throw new Error(noAuthStatusMessage);
    }
    const encryptedRequestData = (0, import_utils.getHeader)(req, import_internal.constants.Headers.ClerkRequestData);
    const decryptedRequestData = (0, import_utils.decryptClerkRequestData)(encryptedRequestData);
    const options = {
      authStatus,
      apiUrl: import_constants.API_URL,
      apiVersion: import_constants.API_VERSION,
      authMessage,
      secretKey: (opts == null ? void 0 : opts.secretKey) || decryptedRequestData.secretKey || import_constants.SECRET_KEY,
      authReason
    };
    logger.debug("Options debug", options);
    if (authStatus === import_internal.AuthStatus.SignedIn) {
      (0, import_utils.assertTokenSignature)(authToken, options.secretKey, authSignature);
      const jwt = (0, import_jwt.decodeJwt)(authToken);
      logger.debug("JWT debug", jwt.raw.text);
      return (0, import_internal.signedInAuthObject)(options, jwt.raw.text, jwt.payload);
    }
    return (0, import_internal.signedOutAuthObject)(options);
  };
});
const getAuth = createGetAuth({
  debugLoggerName: "getAuth()",
  noAuthStatusMessage: (0, import_errors.getAuthAuthHeaderMissing)()
});
const parseJwt = (req) => {
  var _a;
  const cookieToken = (0, import_utils.getCookie)(req, import_internal.constants.Cookies.Session);
  const headerToken = (_a = (0, import_utils.getHeader)(req, "authorization")) == null ? void 0 : _a.replace("Bearer ", "");
  return (0, import_jwt.decodeJwt)(cookieToken || headerToken || "");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createGetAuth,
  getAuth,
  parseJwt
});
//# sourceMappingURL=createGetAuth.js.map