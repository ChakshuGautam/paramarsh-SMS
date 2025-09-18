import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type RaRecord, type DeleteManyParams } from 'ra-core';
import { type ButtonProps } from './Button';
import type { UseMutationOptions } from '@tanstack/react-query';
export declare const BulkDeleteWithUndoButton: (inProps: BulkDeleteWithUndoButtonProps) => React.JSX.Element;
export interface BulkDeleteWithUndoButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    icon?: React.ReactNode;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, DeleteManyParams<RecordType>> & {
        meta?: any;
    };
    successMessage?: string;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaBulkDeleteWithUndoButton: 'root';
    }
    interface ComponentsPropsList {
        RaBulkDeleteWithUndoButton: Partial<BulkDeleteWithUndoButtonProps>;
    }
    interface Components {
        RaBulkDeleteWithUndoButton?: {
            defaultProps?: ComponentsPropsList['RaBulkDeleteWithUndoButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaBulkDeleteWithUndoButton'];
        };
    }
}
//# sourceMappingURL=BulkDeleteWithUndoButton.d.ts.map