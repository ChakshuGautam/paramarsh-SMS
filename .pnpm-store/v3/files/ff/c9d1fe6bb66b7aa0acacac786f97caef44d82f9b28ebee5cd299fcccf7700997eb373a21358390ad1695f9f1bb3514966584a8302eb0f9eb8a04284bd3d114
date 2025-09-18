import * as React from 'react';
import { useCallback } from 'react';
import { useDataTableCallbacksContext, useDataTableDataContext, useDataTableSelectedIdsContext, useTranslate, } from 'ra-core';
import { Checkbox } from '@mui/material';
export var SelectPageCheckbox = function () {
    var data = useDataTableDataContext();
    var _a = useDataTableCallbacksContext(), isRowSelectable = _a.isRowSelectable, onSelect = _a.onSelect;
    var selectedIds = useDataTableSelectedIdsContext();
    var translate = useTranslate();
    var handleSelectAll = useCallback(function (event) {
        if (!onSelect || !selectedIds || !data)
            return;
        onSelect(event.target.checked
            ? selectedIds.concat(data
                .filter(function (record) { return !selectedIds.includes(record.id); })
                .filter(function (record) {
                return isRowSelectable
                    ? isRowSelectable(record)
                    : true;
            })
                .map(function (record) { return record.id; }))
            : []);
    }, [data, onSelect, isRowSelectable, selectedIds]);
    var selectableIds = Array.isArray(data)
        ? isRowSelectable
            ? data
                .filter(function (record) { return isRowSelectable(record); })
                .map(function (record) { return record.id; })
            : data.map(function (record) { return record.id; })
        : [];
    return (React.createElement(Checkbox, { inputProps: {
            'aria-label': translate('ra.action.select_all', {
                _: 'Select all',
            }),
        }, className: "select-all", color: "primary", checked: selectedIds &&
            selectedIds.length > 0 &&
            selectableIds.length > 0 &&
            selectableIds.every(function (id) { return selectedIds.includes(id); }), onChange: handleSelectAll, onClick: function (e) { return e.stopPropagation(); } }));
};
//# sourceMappingURL=SelectPageCheckbox.js.map