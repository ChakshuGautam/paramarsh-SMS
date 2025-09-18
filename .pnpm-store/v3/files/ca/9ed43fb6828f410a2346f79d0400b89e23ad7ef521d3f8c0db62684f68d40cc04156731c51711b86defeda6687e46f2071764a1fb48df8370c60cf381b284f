import * as React from 'react';
import { ReactNode, ReactEventHandler } from 'react';
import { UseMutationOptions } from '@tanstack/react-query';
import { RaRecord, DeleteParams, RedirectionSideEffect } from 'ra-core';
import { ButtonProps } from './Button';
import { ComponentsOverrides } from '@mui/material/styles';
export declare const DeleteWithUndoButton: <RecordType extends RaRecord = any>(inProps: DeleteWithUndoButtonProps<RecordType>) => React.JSX.Element;
export interface DeleteWithUndoButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    icon?: ReactNode;
    onClick?: ReactEventHandler<any>;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, DeleteParams<RecordType>>;
    record?: RecordType;
    redirect?: RedirectionSideEffect;
    resource?: string;
    successMessage?: string;
}
declare const PREFIX = "RaDeleteWithUndoButton";
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        [PREFIX]: 'root';
    }
    interface ComponentsPropsList {
        [PREFIX]: Partial<DeleteWithUndoButtonProps>;
    }
    interface Components {
        [PREFIX]?: {
            defaultProps?: ComponentsPropsList[typeof PREFIX];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>[typeof PREFIX];
        };
    }
}
export {};
//# sourceMappingURL=DeleteWithUndoButton.d.ts.map