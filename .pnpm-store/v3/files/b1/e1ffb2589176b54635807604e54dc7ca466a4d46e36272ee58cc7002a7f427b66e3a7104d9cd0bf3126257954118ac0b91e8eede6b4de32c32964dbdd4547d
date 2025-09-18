"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListIterator = void 0;
var React = __importStar(require("react"));
var useListContextWithProps_1 = require("./useListContextWithProps");
var record_1 = require("../record");
var ListIterator = function (props) {
    var children = props.children, empty = props.empty, errorElement = props.error, loading = props.loading, render = props.render;
    var _a = (0, useListContextWithProps_1.useListContextWithProps)(props), data = _a.data, total = _a.total, isPending = _a.isPending, error = _a.error;
    if (isPending === true) {
        return loading ? loading : null;
    }
    if (error) {
        return errorElement
            ? React.cloneElement(errorElement, { error: error })
            : null;
    }
    if (data == null || data.length === 0 || total === 0) {
        return empty ? empty : null;
    }
    if (!render && !children) {
        throw new Error('<ListIterator>: either `render` or `children` prop must be provided');
    }
    return (React.createElement(React.Fragment, null, data.map(function (record, index) {
        var _a;
        return (React.createElement(record_1.RecordContextProvider, { key: (_a = record.id) !== null && _a !== void 0 ? _a : "row".concat(index), value: record }, render ? render(record, index) : children));
    })));
};
exports.ListIterator = ListIterator;
//# sourceMappingURL=ListIterator.js.map