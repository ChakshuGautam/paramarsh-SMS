import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type MutationMode, type RaRecord, type UpdateParams } from 'ra-core';
import { type ButtonProps } from './Button';
import type { UseMutationOptions } from '@tanstack/react-query';
export declare const UpdateWithConfirmButton: <RecordType extends RaRecord = any, MutationOptionsError extends Error = Error>(inProps: UpdateWithConfirmButtonProps<RecordType, MutationOptionsError>) => React.JSX.Element;
export interface UpdateWithConfirmButtonProps<RecordType extends RaRecord = any, MutationOptionsError extends Error = Error> extends ButtonProps {
    confirmContent?: React.ReactNode;
    confirmTitle?: React.ReactNode;
    icon?: React.ReactNode;
    data: any;
    mutationMode?: MutationMode;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, UpdateParams<RecordType>> & {
        meta?: any;
    };
    titleTranslateOptions?: object;
    contentTranslateOptions?: object;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaUpdateWithConfirmButton: 'root';
    }
    interface ComponentsPropsList {
        RaUpdateWithConfirmButton: Partial<UpdateWithConfirmButtonProps>;
    }
    interface Components {
        RaUpdateWithConfirmButton?: {
            defaultProps?: ComponentsPropsList['RaUpdateWithConfirmButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaUpdateWithConfirmButton'];
        };
    }
}
//# sourceMappingURL=UpdateWithConfirmButton.d.ts.map