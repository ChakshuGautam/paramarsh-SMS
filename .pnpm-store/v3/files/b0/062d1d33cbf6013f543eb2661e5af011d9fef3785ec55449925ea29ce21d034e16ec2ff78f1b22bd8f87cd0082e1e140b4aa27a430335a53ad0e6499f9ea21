import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type MutationMode, type RaRecord, type UpdateManyParams } from 'ra-core';
import { type ButtonProps } from './Button';
import type { UseMutationOptions } from '@tanstack/react-query';
export declare const BulkUpdateWithConfirmButton: (inProps: BulkUpdateWithConfirmButtonProps) => React.JSX.Element;
export interface BulkUpdateWithConfirmButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    confirmContent?: React.ReactNode;
    confirmTitle?: React.ReactNode;
    icon?: React.ReactNode;
    data: any;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    mutationMode?: MutationMode;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, UpdateManyParams<RecordType>> & {
        meta?: any;
    };
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaBulkUpdateWithConfirmButton: 'root';
    }
    interface ComponentsPropsList {
        RaBulkUpdateWithConfirmButton: Partial<BulkUpdateWithConfirmButtonProps>;
    }
    interface Components {
        RaBulkUpdateWithConfirmButton?: {
            defaultProps?: ComponentsPropsList['RaBulkUpdateWithConfirmButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaBulkUpdateWithConfirmButton'];
        };
    }
}
//# sourceMappingURL=BulkUpdateWithConfirmButton.d.ts.map