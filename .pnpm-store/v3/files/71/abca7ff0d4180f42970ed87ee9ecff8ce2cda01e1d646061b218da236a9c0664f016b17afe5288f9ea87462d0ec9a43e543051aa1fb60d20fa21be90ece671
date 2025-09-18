import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type MutationMode, type RaRecord, type DeleteManyParams } from 'ra-core';
import { type ButtonProps } from './Button';
import type { UseMutationOptions } from '@tanstack/react-query';
export declare const BulkDeleteWithConfirmButton: (inProps: BulkDeleteWithConfirmButtonProps) => React.JSX.Element;
export interface BulkDeleteWithConfirmButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    confirmContent?: React.ReactNode;
    confirmTitle?: React.ReactNode;
    confirmColor?: 'primary' | 'warning';
    icon?: React.ReactNode;
    mutationMode: MutationMode;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, DeleteManyParams<RecordType>> & {
        meta?: any;
    };
    successMessage?: string;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaBulkDeleteWithConfirmButton: 'root';
    }
    interface ComponentsPropsList {
        RaBulkDeleteWithConfirmButton: Partial<BulkDeleteWithConfirmButtonProps>;
    }
    interface Components {
        RaBulkDeleteWithConfirmButton?: {
            defaultProps?: ComponentsPropsList['RaBulkDeleteWithConfirmButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaBulkDeleteWithConfirmButton'];
        };
    }
}
//# sourceMappingURL=BulkDeleteWithConfirmButton.d.ts.map