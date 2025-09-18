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
import React, { useMemo } from 'react';
import { useReferenceOneFieldController, } from './useReferenceOneFieldController';
import { useRecordContext, RecordContextProvider } from '../record';
import { ResourceContextProvider } from '../../core';
import { ReferenceFieldContextProvider } from './ReferenceFieldContext';
import { useGetPathForRecord } from '../../routing';
/**
 * Render the related record in a one-to-one relationship
 *
 * Expects a single field as child
 *
 * @example // display the bio of the current author
 * <ReferenceOneFieldBase reference="bios" target="author_id">
 *     <TextField source="body" />
 * </ReferenceOneFieldBase>
 */
export var ReferenceOneFieldBase = function (props) {
    var children = props.children, render = props.render, record = props.record, reference = props.reference, _a = props.source, source = _a === void 0 ? 'id' : _a, target = props.target, empty = props.empty, error = props.error, loading = props.loading, sort = props.sort, filter = props.filter, link = props.link, queryOptions = props.queryOptions;
    var controllerProps = useReferenceOneFieldController({
        record: record,
        reference: reference,
        source: source,
        target: target,
        sort: sort,
        filter: filter,
        queryOptions: queryOptions,
    });
    var path = useGetPathForRecord({
        record: controllerProps.referenceRecord,
        resource: reference,
        link: link,
    });
    var context = useMemo(function () { return (__assign(__assign({}, controllerProps), { link: path })); }, [controllerProps, path]);
    if (!render && !children) {
        throw new Error("<ReferenceOneFieldBase> requires either a 'render' prop or 'children' prop");
    }
    var recordFromContext = useRecordContext(props);
    if (controllerProps.isPending && loading) {
        return (React.createElement(ResourceContextProvider, { value: reference }, loading));
    }
    if (controllerProps.error && error) {
        return (React.createElement(ResourceContextProvider, { value: reference },
            React.createElement(ReferenceFieldContextProvider, { value: context }, error)));
    }
    if (!recordFromContext ||
        (!controllerProps.isPending && controllerProps.referenceRecord == null)) {
        return (React.createElement(ResourceContextProvider, { value: reference }, empty));
    }
    return (React.createElement(ResourceContextProvider, { value: reference },
        React.createElement(ReferenceFieldContextProvider, { value: context },
            React.createElement(RecordContextProvider, { value: context.referenceRecord }, render ? render(controllerProps) : children))));
};
//# sourceMappingURL=ReferenceOneFieldBase.js.map