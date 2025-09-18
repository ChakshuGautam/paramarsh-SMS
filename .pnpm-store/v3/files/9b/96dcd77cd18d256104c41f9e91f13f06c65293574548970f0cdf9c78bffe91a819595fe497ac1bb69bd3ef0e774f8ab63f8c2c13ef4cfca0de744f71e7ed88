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
import React, { Fragment, isValidElement } from 'react';
import ActionDelete from '@mui/icons-material/Delete';
import { styled, useThemeProps, } from '@mui/material/styles';
import clsx from 'clsx';
import { useDeleteWithConfirmController, useRecordContext, useResourceContext, useTranslate, useGetRecordRepresentation, useResourceTranslation, } from 'ra-core';
import { humanize, singularize } from 'inflection';
import { Confirm } from '../layout';
import { Button } from './Button';
export var DeleteWithConfirmButton = function (inProps) {
    var props = useThemeProps({
        props: inProps,
        name: PREFIX,
    });
    var className = props.className, confirmTitleProp = props.confirmTitle, confirmContentProp = props.confirmContent, _a = props.confirmColor, confirmColor = _a === void 0 ? 'primary' : _a, _b = props.icon, icon = _b === void 0 ? defaultIcon : _b, labelProp = props.label, _c = props.mutationMode, mutationMode = _c === void 0 ? 'pessimistic' : _c, onClick = props.onClick, _d = props.redirect, redirect = _d === void 0 ? 'list' : _d, _e = props.translateOptions, translateOptions = _e === void 0 ? {} : _e, _f = props.titleTranslateOptions, titleTranslateOptions = _f === void 0 ? translateOptions : _f, _g = props.contentTranslateOptions, contentTranslateOptions = _g === void 0 ? translateOptions : _g, mutationOptions = props.mutationOptions, _h = props.color, color = _h === void 0 ? 'error' : _h, successMessage = props.successMessage, rest = __rest(props, ["className", "confirmTitle", "confirmContent", "confirmColor", "icon", "label", "mutationMode", "onClick", "redirect", "translateOptions", "titleTranslateOptions", "contentTranslateOptions", "mutationOptions", "color", "successMessage"]);
    var translate = useTranslate();
    var record = useRecordContext(props);
    var resource = useResourceContext(props);
    if (!resource) {
        throw new Error('<DeleteWithConfirmButton> components should be used inside a <Resource> component or provided with a resource prop. (The <Resource> component set the resource prop for all its children).');
    }
    var _j = useDeleteWithConfirmController({
        record: record,
        redirect: redirect,
        mutationMode: mutationMode,
        onClick: onClick,
        mutationOptions: mutationOptions,
        resource: resource,
        successMessage: successMessage,
    }), open = _j.open, isPending = _j.isPending, handleDialogOpen = _j.handleDialogOpen, handleDialogClose = _j.handleDialogClose, handleDelete = _j.handleDelete;
    var getRecordRepresentation = useGetRecordRepresentation(resource);
    var recordRepresentation = getRecordRepresentation(record);
    var resourceName = translate("resources.".concat(resource, ".forcedCaseName"), {
        smart_count: 1,
        _: humanize(translate("resources.".concat(resource, ".name"), {
            smart_count: 1,
            _: resource ? singularize(resource) : undefined,
        }), true),
    });
    // We don't support React elements for this
    if (isValidElement(recordRepresentation)) {
        recordRepresentation = "#".concat(record === null || record === void 0 ? void 0 : record.id);
    }
    var label = useResourceTranslation({
        resourceI18nKey: "resources.".concat(resource, ".action.delete"),
        baseI18nKey: 'ra.action.delete',
        options: {
            name: resourceName,
            recordRepresentation: recordRepresentation,
        },
        userText: labelProp,
    });
    var confirmTitle = useResourceTranslation({
        resourceI18nKey: "resources.".concat(resource, ".message.delete_title"),
        baseI18nKey: 'ra.message.delete_title',
        options: __assign({ recordRepresentation: recordRepresentation, name: resourceName, id: record === null || record === void 0 ? void 0 : record.id }, titleTranslateOptions),
        userText: confirmTitleProp,
    });
    var confirmContent = useResourceTranslation({
        resourceI18nKey: "resources.".concat(resource, ".message.delete_content"),
        baseI18nKey: 'ra.message.delete_content',
        options: __assign({ recordRepresentation: recordRepresentation, name: resourceName, id: record === null || record === void 0 ? void 0 : record.id }, contentTranslateOptions),
        userText: confirmContentProp,
    });
    return (React.createElement(Fragment, null,
        React.createElement(StyledButton, __assign({ onClick: handleDialogOpen, 
            // avoid double translation
            label: React.createElement(React.Fragment, null, label), "aria-label": typeof label === 'string' ? label : undefined, className: clsx('ra-delete-button', className), key: "button", color: color }, rest), icon),
        React.createElement(Confirm, { isOpen: open, loading: isPending, title: React.createElement(React.Fragment, null, confirmTitle), content: React.createElement(React.Fragment, null, confirmContent), confirmColor: confirmColor, onConfirm: handleDelete, onClose: handleDialogClose })));
};
var defaultIcon = React.createElement(ActionDelete, null);
var PREFIX = 'RaDeleteWithConfirmButton';
var StyledButton = styled(Button, {
    name: PREFIX,
    overridesResolver: function (props, styles) { return styles.root; },
})({});
//# sourceMappingURL=DeleteWithConfirmButton.js.map