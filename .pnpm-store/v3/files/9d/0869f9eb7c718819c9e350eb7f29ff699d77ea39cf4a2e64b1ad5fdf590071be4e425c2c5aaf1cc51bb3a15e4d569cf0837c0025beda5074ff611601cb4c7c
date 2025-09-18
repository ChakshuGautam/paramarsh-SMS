import * as React from 'react';
import type { ReactElement, ElementType, ReactNode } from 'react';
import { type ComponentsOverrides, type SxProps, type Theme } from '@mui/material';
import { EditControllerResult } from 'ra-core';
import { EditProps } from './Edit';
export declare const EditView: (props: EditViewProps) => React.JSX.Element | null;
export interface EditViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'title'> {
    actions?: ReactElement | false;
    aside?: ReactElement;
    component?: ElementType;
    emptyWhileLoading?: boolean;
    title?: string | ReactElement | false;
    sx?: SxProps<Theme>;
    render?: (editContext: EditControllerResult) => ReactNode;
}
export declare const EditClasses: {
    main: string;
    noActions: string;
    card: string;
};
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaEdit: 'root' | 'main' | 'noActions' | 'card';
    }
    interface ComponentsPropsList {
        RaEdit: Partial<EditProps>;
    }
    interface Components {
        RaEdit?: {
            defaultProps?: ComponentsPropsList['RaEdit'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaEdit'];
        };
    }
}
//# sourceMappingURL=EditView.d.ts.map