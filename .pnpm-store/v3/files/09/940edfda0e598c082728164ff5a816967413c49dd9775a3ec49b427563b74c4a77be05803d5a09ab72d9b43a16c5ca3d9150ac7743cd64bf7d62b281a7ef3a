import * as React from 'react';
import { type ReactElement, type ReactNode } from 'react';
import { type ComponentsOverrides, type SxProps, type Theme } from '@mui/material';
import { type RaRecord } from 'ra-core';
import { type UseFieldArrayReturn } from 'react-hook-form';
import { DisableRemoveFunction } from './SimpleFormIteratorItem';
export declare const SimpleFormIterator: (inProps: SimpleFormIteratorProps) => React.JSX.Element | null;
type GetItemLabelFunc = (index: number) => string | ReactElement;
export interface SimpleFormIteratorProps extends Partial<UseFieldArrayReturn> {
    addButton?: ReactElement;
    children?: ReactNode;
    className?: string;
    readOnly?: boolean;
    disabled?: boolean;
    disableAdd?: boolean;
    disableClear?: boolean;
    disableRemove?: boolean | DisableRemoveFunction;
    disableReordering?: boolean;
    fullWidth?: boolean;
    getItemLabel?: boolean | GetItemLabelFunc;
    inline?: boolean;
    meta?: {
        error?: any;
        submitFailed?: boolean;
    };
    record?: RaRecord;
    removeButton?: ReactElement;
    reOrderButtons?: ReactElement;
    resource?: string;
    source?: string;
    sx?: SxProps<Theme>;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaSimpleFormIterator: 'root' | 'action' | 'add' | 'clear' | 'form' | 'index' | 'inline' | 'line' | 'list' | 'buttons';
    }
    interface ComponentsPropsList {
        RaSimpleFormIterator: Partial<SimpleFormIteratorProps>;
    }
    interface Components {
        RaSimpleFormIterator?: {
            defaultProps?: ComponentsPropsList['RaSimpleFormIterator'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaSimpleFormIterator'];
        };
    }
}
export {};
//# sourceMappingURL=SimpleFormIterator.d.ts.map