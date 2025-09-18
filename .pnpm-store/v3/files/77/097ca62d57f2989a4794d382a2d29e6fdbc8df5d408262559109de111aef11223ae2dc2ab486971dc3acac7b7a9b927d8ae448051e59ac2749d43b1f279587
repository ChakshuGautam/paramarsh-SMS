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
import * as React from 'react';
import { useDataTableRenderContext, } from 'ra-core';
import { DataTableCell } from './DataTableCell';
import { DataTableHeadCell } from './DataTableHeadCell';
import { ColumnsSelectorItem } from './ColumnsSelectorItem';
import { genericMemo } from '../../field/genericMemo';
var DataTableColumnImpl = React.forwardRef(function (props, ref) {
    var renderContext = useDataTableRenderContext();
    switch (renderContext) {
        case 'columnsSelector':
            return React.createElement(ColumnsSelectorItem, __assign({}, props));
        case 'header':
            return React.createElement(DataTableHeadCell, __assign({}, props, { ref: ref }));
        case 'data':
            return React.createElement(DataTableCell, __assign({}, props, { ref: ref }));
        case 'footer':
            return React.createElement(DataTableCell, __assign({}, props, { ref: ref }));
    }
});
export var DataTableColumn = genericMemo(DataTableColumnImpl);
//# sourceMappingURL=DataTableColumn.js.map