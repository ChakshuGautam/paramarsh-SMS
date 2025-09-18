import * as React from 'react';
import { useListContextWithProps } from './useListContextWithProps';
import { RecordContextProvider } from '../record';
export var ListIterator = function (props) {
    var children = props.children, empty = props.empty, errorElement = props.error, loading = props.loading, render = props.render;
    var _a = useListContextWithProps(props), data = _a.data, total = _a.total, isPending = _a.isPending, error = _a.error;
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
        return (React.createElement(RecordContextProvider, { key: (_a = record.id) !== null && _a !== void 0 ? _a : "row".concat(index), value: record }, render ? render(record, index) : children));
    })));
};
//# sourceMappingURL=ListIterator.js.map