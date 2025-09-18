import { pathToRegexp } from "@clerk/shared/pathToRegexp";
const createRouteMatcher = (routes) => {
  if (typeof routes === "function") {
    return (req) => routes(req);
  }
  const routePatterns = [routes || ""].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (req) => matchers.some((matcher) => matcher.test(req.nextUrl.pathname));
};
const precomputePathRegex = (patterns) => {
  return patterns.map((pattern) => pattern instanceof RegExp ? pattern : pathToRegexp(pattern));
};
export {
  createRouteMatcher
};
//# sourceMappingURL=routeMatcher.js.map