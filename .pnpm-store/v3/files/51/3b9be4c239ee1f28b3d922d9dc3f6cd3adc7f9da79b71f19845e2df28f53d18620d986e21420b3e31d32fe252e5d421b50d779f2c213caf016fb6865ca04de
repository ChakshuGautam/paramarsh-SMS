"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceManyCountBase = void 0;
var react_1 = __importDefault(require("react"));
var useReferenceManyFieldController_1 = require("./useReferenceManyFieldController");
var hooks_1 = require("../../util/hooks");
/**
 * Fetch and render the number of records related to the current one
 *
 * Relies on dataProvider.getManyReference() returning a total property
 *
 * @example // Display the number of comments for the current post
 * <ReferenceManyCountBase reference="comments" target="post_id" />
 *
 * @example // Display the number of published comments for the current post
 * <ReferenceManyCountBase reference="comments" target="post_id" filter={{ is_published: true }} />
 */
var ReferenceManyCountBase = function (props) {
    var _a = props.loading, loading = _a === void 0 ? null : _a, _b = props.error, error = _b === void 0 ? null : _b, _c = props.timeout, timeout = _c === void 0 ? 1000 : _c, rest = __rest(props, ["loading", "error", "timeout"]);
    var oneSecondHasPassed = (0, hooks_1.useTimeout)(timeout);
    var _d = (0, useReferenceManyFieldController_1.useReferenceManyFieldController)(__assign(__assign({}, rest), { page: 1, perPage: 1 })), isPending = _d.isPending, fetchError = _d.error, total = _d.total;
    return (react_1.default.createElement(react_1.default.Fragment, null, isPending
        ? oneSecondHasPassed
            ? loading
            : null
        : fetchError
            ? error
            : total));
};
exports.ReferenceManyCountBase = ReferenceManyCountBase;
//# sourceMappingURL=ReferenceManyCountBase.js.map