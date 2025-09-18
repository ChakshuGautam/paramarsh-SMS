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
exports.UpdateWithConfirmButton = void 0;
var React = __importStar(require("react"));
var react_1 = require("react");
var Update_1 = __importDefault(require("@mui/icons-material/Update"));
var styles_1 = require("@mui/material/styles");
var ra_core_1 = require("ra-core");
var layout_1 = require("../layout");
var Button_1 = require("./Button");
var inflection_1 = require("inflection");
var UpdateWithConfirmButton = function (inProps) {
    var props = (0, styles_1.useThemeProps)({
        props: inProps,
        name: PREFIX,
    });
    var notify = (0, ra_core_1.useNotify)();
    var translate = (0, ra_core_1.useTranslate)();
    var resource = (0, ra_core_1.useResourceContext)(props);
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setOpen = _a[1];
    var record = (0, ra_core_1.useRecordContext)(props);
    var confirmTitleProp = props.confirmTitle, confirmContentProp = props.confirmContent, data = props.data, _b = props.icon, icon = _b === void 0 ? defaultIcon : _b, labelProp = props.label, _c = props.mutationMode, mutationMode = _c === void 0 ? 'pessimistic' : _c, onClick = props.onClick, _d = props.mutationOptions, mutationOptions = _d === void 0 ? emptyObject : _d, _e = props.titleTranslateOptions, titleTranslateOptions = _e === void 0 ? emptyObject : _e, _f = props.contentTranslateOptions, contentTranslateOptions = _f === void 0 ? emptyObject : _f, rest = __rest(props, ["confirmTitle", "confirmContent", "data", "icon", "label", "mutationMode", "onClick", "mutationOptions", "titleTranslateOptions", "contentTranslateOptions"]);
    var mutationMeta = mutationOptions.meta, _g = mutationOptions.onSuccess, onSuccess = _g === void 0 ? function () {
        notify("resources.".concat(resource, ".notifications.updated"), {
            type: 'info',
            messageArgs: {
                smart_count: 1,
                _: translate('ra.notification.updated', { smart_count: 1 }),
            },
            undoable: mutationMode === 'undoable',
        });
    } : _g, _h = mutationOptions.onError, onError = _h === void 0 ? function (error) {
        notify(typeof error === 'string'
            ? error
            : error.message || 'ra.notification.http_error', {
            type: 'error',
            messageArgs: {
                _: typeof error === 'string'
                    ? error
                    : error && error.message
                        ? error.message
                        : undefined,
            },
        });
    } : _h, _j = mutationOptions.onSettled, onSettled = _j === void 0 ? function () {
        setOpen(false);
    } : _j, otherMutationOptions = __rest(mutationOptions, ["meta", "onSuccess", "onError", "onSettled"]);
    var _k = (0, ra_core_1.useUpdate)(resource, { id: record === null || record === void 0 ? void 0 : record.id, data: data, meta: mutationMeta, previousData: record }, __assign({ onSuccess: onSuccess, onError: onError, onSettled: onSettled, mutationMode: mutationMode }, otherMutationOptions)), update = _k[0], isPending = _k[1].isPending;
    var handleClick = function (e) {
        setOpen(true);
        e.stopPropagation();
    };
    var handleDialogClose = function () {
        setOpen(false);
    };
    var handleUpdate = function (e) {
        update(resource, {
            id: record === null || record === void 0 ? void 0 : record.id,
            data: data,
            meta: mutationMeta,
            previousData: record,
        });
        if (typeof onClick === 'function') {
            onClick(e);
        }
    };
    var getRecordRepresentation = (0, ra_core_1.useGetRecordRepresentation)(resource);
    var recordRepresentation = getRecordRepresentation(record);
    var resourceName = translate("resources.".concat(resource, ".forcedCaseName"), {
        smart_count: 1,
        _: (0, inflection_1.humanize)(translate("resources.".concat(resource, ".name"), {
            smart_count: 1,
            _: resource ? (0, inflection_1.singularize)(resource) : undefined,
        }), true),
    });
    // We don't support React elements for this
    if (React.isValidElement(recordRepresentation)) {
        recordRepresentation = "#".concat(record === null || record === void 0 ? void 0 : record.id);
    }
    var label = (0, ra_core_1.useResourceTranslation)({
        resourceI18nKey: "resources.".concat(resource, ".action.update"),
        baseI18nKey: 'ra.action.update',
        options: {
            name: resourceName,
            recordRepresentation: recordRepresentation,
        },
        userText: labelProp,
    });
    var confirmTitle = (0, ra_core_1.useResourceTranslation)({
        resourceI18nKey: "resources.".concat(resource, ".message.bulk_update_title"),
        baseI18nKey: 'ra.message.bulk_update_title',
        options: __assign({ recordRepresentation: recordRepresentation, name: resourceName, id: record === null || record === void 0 ? void 0 : record.id, smart_count: 1 }, titleTranslateOptions),
        userText: confirmTitleProp,
    });
    var confirmContent = (0, ra_core_1.useResourceTranslation)({
        resourceI18nKey: "resources.".concat(resource, ".message.bulk_update_content"),
        baseI18nKey: 'ra.message.bulk_update_content',
        options: __assign({ recordRepresentation: recordRepresentation, name: resourceName, id: record === null || record === void 0 ? void 0 : record.id, smart_count: 1 }, contentTranslateOptions),
        userText: confirmContentProp,
    });
    return (React.createElement(react_1.Fragment, null,
        React.createElement(StyledButton, __assign({ onClick: handleClick, 
            // avoid double translation
            label: React.createElement(React.Fragment, null, label), "aria-label": typeof label === 'string' ? label : undefined }, sanitizeRestProps(rest)), icon),
        React.createElement(layout_1.Confirm, { isOpen: isOpen, loading: isPending, title: React.createElement(React.Fragment, null, confirmTitle), content: React.createElement(React.Fragment, null, confirmContent), onConfirm: handleUpdate, onClose: handleDialogClose })));
};
exports.UpdateWithConfirmButton = UpdateWithConfirmButton;
var sanitizeRestProps = function (_a) {
    var label = _a.label, rest = __rest(_a, ["label"]);
    return rest;
};
var PREFIX = 'RaUpdateWithConfirmButton';
var StyledButton = (0, styles_1.styled)(Button_1.Button, {
    name: PREFIX,
    overridesResolver: function (props, styles) { return styles.root; },
})(function (_a) {
    var theme = _a.theme;
    return ({
        color: (theme.vars || theme).palette.primary.main,
        '&:hover': {
            backgroundColor: "color-mix(in srgb, ".concat((theme.vars || theme).palette.primary.main, ", transparent 12%)"),
            // Reset on mouse devices
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            },
        },
    });
});
var defaultIcon = React.createElement(Update_1.default, null);
var emptyObject = {};
//# sourceMappingURL=UpdateWithConfirmButton.js.map