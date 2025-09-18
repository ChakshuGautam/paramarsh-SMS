import { AuthStatus, constants, signedInAuthObject, signedOutAuthObject } from "@clerk/backend/internal";
import { decodeJwt } from "@clerk/backend/jwt";
import { withLogger } from "../utils/debugLogger";
import { API_URL, API_VERSION, SECRET_KEY } from "./constants";
import { getAuthAuthHeaderMissing } from "./errors";
import { assertTokenSignature, decryptClerkRequestData, getAuthKeyFromRequest, getCookie, getHeader } from "./utils";
const createGetAuth = ({
  noAuthStatusMessage,
  debugLoggerName
}) => withLogger(debugLoggerName, (logger) => {
  return (req, opts) => {
    if (getHeader(req, constants.Headers.EnableDebug) === "true") {
      logger.enable();
    }
    const authToken = getAuthKeyFromRequest(req, "AuthToken");
    const authSignature = getAuthKeyFromRequest(req, "AuthSignature");
    const authMessage = getAuthKeyFromRequest(req, "AuthMessage");
    const authReason = getAuthKeyFromRequest(req, "AuthReason");
    const authStatus = getAuthKeyFromRequest(req, "AuthStatus");
    logger.debug("Headers debug", { authStatus, authMessage, authReason });
    if (!authStatus) {
      throw new Error(noAuthStatusMessage);
    }
    const encryptedRequestData = getHeader(req, constants.Headers.ClerkRequestData);
    const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);
    const options = {
      authStatus,
      apiUrl: API_URL,
      apiVersion: API_VERSION,
      authMessage,
      secretKey: (opts == null ? void 0 : opts.secretKey) || decryptedRequestData.secretKey || SECRET_KEY,
      authReason
    };
    logger.debug("Options debug", options);
    if (authStatus === AuthStatus.SignedIn) {
      assertTokenSignature(authToken, options.secretKey, authSignature);
      const jwt = decodeJwt(authToken);
      logger.debug("JWT debug", jwt.raw.text);
      return signedInAuthObject(options, jwt.raw.text, jwt.payload);
    }
    return signedOutAuthObject(options);
  };
});
const getAuth = createGetAuth({
  debugLoggerName: "getAuth()",
  noAuthStatusMessage: getAuthAuthHeaderMissing()
});
const parseJwt = (req) => {
  var _a;
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = (_a = getHeader(req, "authorization")) == null ? void 0 : _a.replace("Bearer ", "");
  return decodeJwt(cookieToken || headerToken || "");
};
export {
  createGetAuth,
  getAuth,
  parseJwt
};
//# sourceMappingURL=createGetAuth.js.map