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
var protect_exports = {};
__export(protect_exports, {
  createProtect: () => createProtect
});
module.exports = __toCommonJS(protect_exports);
var import_internal = require("@clerk/backend/internal");
var import_constants = require("../constants");
var import_nextFetcher = require("./nextFetcher");
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
  return !!req.headers.get(import_constants.constants.Headers.NextUrl) && (((_a = req.headers.get(import_internal.constants.Headers.Accept)) == null ? void 0 : _a.includes("text/x-component")) || ((_b = req.headers.get(import_internal.constants.Headers.ContentType)) == null ? void 0 : _b.includes("multipart/form-data")) || !!req.headers.get(import_constants.constants.Headers.NextAction));
};
const isPageRequest = (req) => {
  var _a;
  return req.headers.get(import_internal.constants.Headers.SecFetchDest) === "document" || req.headers.get(import_internal.constants.Headers.SecFetchDest) === "iframe" || ((_a = req.headers.get(import_internal.constants.Headers.Accept)) == null ? void 0 : _a.includes("text/html")) || isAppRouterInternalNavigation(req) || isPagesRouterInternalNavigation(req);
};
const isAppRouterInternalNavigation = (req) => !!req.headers.get(import_constants.constants.Headers.NextUrl) && !isServerActionRequest(req) || isPagePathAvailable();
const isPagePathAvailable = () => {
  var _a;
  const __fetch = globalThis.fetch;
  return Boolean((0, import_nextFetcher.isNextFetcher)(__fetch) ? (_a = __fetch.__nextGetStaticStore().getStore()) == null ? void 0 : _a.pagePath : false);
};
const isPagesRouterInternalNavigation = (req) => !!req.headers.get(import_constants.constants.Headers.NextjsData);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createProtect
});
//# sourceMappingURL=protect.js.map