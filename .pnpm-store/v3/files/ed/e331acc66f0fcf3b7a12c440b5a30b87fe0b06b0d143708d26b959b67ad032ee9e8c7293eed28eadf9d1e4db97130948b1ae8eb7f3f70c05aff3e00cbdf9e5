import * as React from 'react';
import { type ComponentsOverrides } from '@mui/material/styles';
import { type RaRecord, type UpdateParams } from 'ra-core';
import type { UseMutationOptions } from '@tanstack/react-query';
import { type ButtonProps } from './Button';
export declare const UpdateWithUndoButton: (inProps: UpdateWithUndoButtonProps) => React.JSX.Element;
export interface UpdateWithUndoButtonProps<RecordType extends RaRecord = any, MutationOptionsError = unknown> extends ButtonProps {
    icon?: React.ReactNode;
    data: any;
    mutationOptions?: UseMutationOptions<RecordType, MutationOptionsError, UpdateParams<RecordType>> & {
        meta?: any;
    };
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaUpdateWithUndoButton: 'root';
    }
    interface ComponentsPropsList {
        RaUpdateWithUndoButton: Partial<UpdateWithUndoButtonProps>;
    }
    interface Components {
        RaUpdateWithUndoButton?: {
            defaultProps?: ComponentsPropsList['RaUpdateWithUndoButton'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaUpdateWithUndoButton'];
        };
    }
}
//# sourceMappingURL=UpdateWithUndoButton.d.ts.map