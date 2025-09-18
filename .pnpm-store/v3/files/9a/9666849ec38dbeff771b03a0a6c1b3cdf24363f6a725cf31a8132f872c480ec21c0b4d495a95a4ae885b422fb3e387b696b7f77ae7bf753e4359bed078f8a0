import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type RaRecord, type UpdateManyParams } from 'ra-core';
import type { UseMutationOptions } from '@tanstack/react-query';
import { type ButtonProps } from './Button';
export declare const BulkUpdateWithUndoButton: (inProps: BulkUpdateWithUndoButtonProps) => React.JSX.Element;
export interface BulkUpdateWithUndoButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    icon?: React.ReactNode;
    data: any;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, UpdateManyParams<RecordType>> & {
        meta?: any;
    };
    successMessage?: string;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaBulkUpdateWithUndoButton: 'root';
    }
    interface ComponentsPropsList {
        RaBulkUpdateWithUndoButton: Partial<BulkUpdateWithUndoButtonProps>;
    }
    interface Components {
        RaBulkUpdateWithUndoButton?: {
            defaultProps?: ComponentsPropsList['RaBulkUpdateWithUndoButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaBulkUpdateWithUndoButton'];
        };
    }
}
//# sourceMappingURL=BulkUpdateWithUndoButton.d.ts.map