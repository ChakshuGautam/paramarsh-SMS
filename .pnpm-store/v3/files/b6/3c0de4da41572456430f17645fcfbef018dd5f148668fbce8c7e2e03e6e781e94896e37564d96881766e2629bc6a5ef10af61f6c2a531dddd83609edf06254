import * as React from 'react';
import type { ElementType, ReactElement, ReactNode } from 'react';
import { type ComponentsOverrides, type SxProps, type Theme } from '@mui/material';
import { CreateControllerResult } from 'ra-core';
import { CreateProps } from './Create';
export declare const CreateView: (props: CreateViewProps) => React.JSX.Element;
export interface CreateViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    actions?: ReactElement | false;
    aside?: ReactElement;
    component?: ElementType;
    sx?: SxProps<Theme>;
    title?: string | ReactElement | false;
    render?: (createContext: CreateControllerResult) => ReactNode;
    children?: ReactNode;
}
export declare const CreateClasses: {
    main: string;
    noActions: string;
    card: string;
};
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaCreate: 'root' | 'main' | 'noActions' | 'card';
    }
    interface ComponentsPropsList {
        RaCreate: Partial<CreateProps>;
    }
    interface Components {
        RaCreate?: {
            defaultProps?: ComponentsPropsList['RaCreate'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaCreate'];
        };
    }
}
//# sourceMappingURL=CreateView.d.ts.map