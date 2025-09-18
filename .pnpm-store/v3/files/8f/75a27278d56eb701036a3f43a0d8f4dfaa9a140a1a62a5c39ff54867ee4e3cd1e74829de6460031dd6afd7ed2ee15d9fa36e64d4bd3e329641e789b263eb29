import { constants } from "@clerk/backend/internal";
import { constants as nextConstants } from "../constants";
import { isNextFetcher } from "./nextFetcher";
const createProtect = (opts) => {
  const { redirectToSignIn, authObject, redirect, notFound, request } = opts;
  return (...args) => {
    var _a, _b, _c, _d, _e, _f;
    const optionValuesAsParam = ((_a = args[0]) == null ? void 0 : _a.unauthenticatedUrl) || ((_b = args[0]) == null ? void 0 : _b.unauthorizedUrl);
    const paramsOrFunction = optionValuesAsParam ? void 0 : args[0];
    const unauthenticatedUrl = ((_c = args[0]) == null ? void 0 : _c.unauthenticatedUrl) || ((_d = args[1]) == null ? void 0 : _d.unauthenticatedUrl);
    const unauthorizedUrl = ((_e = args[0]) == null ? void 0 : _e.unauthorizedUrl) || ((_f = args[1]) == null ? void 0 : _f.unauthorizedUrl);
    const handleUnauthenticated = () => {
      if (unauthenticatedUrl) {
        return redirect(unauthenticatedUrl);
      }
      if (isPageRequest(request)) {
        return redirectToSignIn();
      }
      return notFound();
    };
    const handleUnauthorized = () => {
      if (unauthorizedUrl) {
        return redirect(unauthorizedUrl);
      }
      return notFound();
    };
    if (!authObject.userId) {
      return handleUnauthenticated();
    }
    if (!paramsOrFunction) {
      return authObject;
    }
    if (typeof paramsOrFunction === "function") {
      if (paramsOrFunction(authObject.has)) {
        return authObject;
      }
      return handleUnauthorized();
    }
    if (authObject.has(paramsOrFunction)) {
      return authObject;
    }
    return handleUnauthorized();
  };
};
const isServerActionRequest = (req) => {
  var _a, _b;
  return !!req.headers.get(nextConstants.Headers.NextUrl) && (((_a = req.headers.get(constants.Headers.Accept)) == null ? void 0 : _a.includes("text/x-component")) || ((_b = req.headers.get(constants.Headers.ContentType)) == null ? void 0 : _b.includes("multipart/form-data")) || !!req.headers.get(nextConstants.Headers.NextAction));
};
const isPageRequest = (req) => {
  var _a;
  return req.headers.get(constants.Headers.SecFetchDest) === "document" || req.headers.get(constants.Headers.SecFetchDest) === "iframe" || ((_a = req.headers.get(constants.Headers.Accept)) == null ? void 0 : _a.includes("text/html")) || isAppRouterInternalNavigation(req) || isPagesRouterInternalNavigation(req);
};
const isAppRouterInternalNavigation = (req) => !!req.headers.get(nextConstants.Headers.NextUrl) && !isServerActionRequest(req) || isPagePathAvailable();
const isPagePathAvailable = () => {
  var _a;
  const __fetch = globalThis.fetch;
  return Boolean(isNextFetcher(__fetch) ? (_a = __fetch.__nextGetStaticStore().getStore()) == null ? void 0 : _a.pagePath : false);
};
const isPagesRouterInternalNavigation = (req) => !!req.headers.get(nextConstants.Headers.NextjsData);
export {
  createProtect
};
//# sourceMappingURL=protect.js.map