"use client";
import {
  CreateOrganization as BaseCreateOrganization,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile
} from "@clerk/clerk-react";
import React from "react";
import { useEnforceCorrectRoutingProps } from "./hooks/useEnforceRoutingProps";
import {
  OrganizationList,
  OrganizationSwitcher,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  GoogleOneTap
} from "@clerk/clerk-react";
const UserProfile = Object.assign(
  (props) => {
    return /* @__PURE__ */ React.createElement(BaseUserProfile, { ...useEnforceCorrectRoutingProps("UserProfile", props) });
  },
  { ...BaseUserProfile }
);
const CreateOrganization = (props) => {
  return /* @__PURE__ */ React.createElement(BaseCreateOrganization, { ...useEnforceCorrectRoutingProps("CreateOrganization", props) });
};
const OrganizationProfile = Object.assign(
  (props) => {
    return /* @__PURE__ */ React.createElement(BaseOrganizationProfile, { ...useEnforceCorrectRoutingProps("OrganizationProfile", props) });
  },
  { ...BaseOrganizationProfile }
);
const SignIn = (props) => {
  return /* @__PURE__ */ React.createElement(BaseSignIn, { ...useEnforceCorrectRoutingProps("SignIn", props, false) });
};
const SignUp = (props) => {
  return /* @__PURE__ */ React.createElement(BaseSignUp, { ...useEnforceCorrectRoutingProps("SignUp", props, false) });
};
export {
  CreateOrganization,
  GoogleOneTap,
  OrganizationList,
  OrganizationProfile,
  OrganizationSwitcher,
  SignIn,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUp,
  SignUpButton,
  UserButton,
  UserProfile
};
//# sourceMappingURL=uiComponents.js.map