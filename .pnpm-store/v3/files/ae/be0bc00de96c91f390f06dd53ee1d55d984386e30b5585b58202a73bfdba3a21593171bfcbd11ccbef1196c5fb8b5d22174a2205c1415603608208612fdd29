import { headers } from "next/headers";
import React from "react";
import { mergeNextClerkPropsWithEnv } from "../../utils/mergeNextClerkPropsWithEnv";
import { ClientClerkProvider } from "../client/ClerkProvider";
import { initialState } from "./auth";
import { getScriptNonceFromHeader } from "./utils";
function ClerkProvider(props) {
  var _a;
  const { children, ...rest } = props;
  const state = (_a = initialState()) == null ? void 0 : _a.__clerk_ssr_state;
  const cspHeader = headers().get("Content-Security-Policy");
  return /* @__PURE__ */ React.createElement(
    ClientClerkProvider,
    {
      ...mergeNextClerkPropsWithEnv(rest),
      nonce: getScriptNonceFromHeader(cspHeader || ""),
      initialState: state
    },
    children
  );
}
export {
  ClerkProvider
};
//# sourceMappingURL=ClerkProvider.js.map