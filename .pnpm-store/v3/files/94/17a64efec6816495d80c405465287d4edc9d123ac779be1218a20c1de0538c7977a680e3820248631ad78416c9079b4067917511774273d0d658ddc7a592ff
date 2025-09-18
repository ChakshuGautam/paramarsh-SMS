import { isCurrentDevAccountPortalOrigin, isLegacyDevAccountPortalOrigin } from "@clerk/shared/url";
const accountPortalCache = /* @__PURE__ */ new Map();
function isDevAccountPortalOrigin(hostname) {
  if (!hostname) {
    return false;
  }
  let res = accountPortalCache.get(hostname);
  if (res === void 0) {
    res = isLegacyDevAccountPortalOrigin(hostname) || isCurrentDevAccountPortalOrigin(hostname);
    accountPortalCache.set(hostname, res);
  }
  return res;
}
export {
  isDevAccountPortalOrigin
};
//# sourceMappingURL=url.js.map