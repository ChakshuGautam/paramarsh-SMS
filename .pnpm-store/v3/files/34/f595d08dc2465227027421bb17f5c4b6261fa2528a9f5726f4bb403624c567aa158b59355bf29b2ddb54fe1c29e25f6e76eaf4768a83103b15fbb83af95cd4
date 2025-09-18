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
import React from 'react';
import { useReferenceManyFieldController, } from './useReferenceManyFieldController';
import { useTimeout } from '../../util/hooks';
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
export var ReferenceManyCountBase = function (props) {
    var _a = props.loading, loading = _a === void 0 ? null : _a, _b = props.error, error = _b === void 0 ? null : _b, _c = props.timeout, timeout = _c === void 0 ? 1000 : _c, rest = __rest(props, ["loading", "error", "timeout"]);
    var oneSecondHasPassed = useTimeout(timeout);
    var _d = useReferenceManyFieldController(__assign(__assign({}, rest), { page: 1, perPage: 1 })), isPending = _d.isPending, fetchError = _d.error, total = _d.total;
    return (React.createElement(React.Fragment, null, isPending
        ? oneSecondHasPassed
            ? loading
            : null
        : fetchError
            ? error
            : total));
};
//# sourceMappingURL=ReferenceManyCountBase.js.map