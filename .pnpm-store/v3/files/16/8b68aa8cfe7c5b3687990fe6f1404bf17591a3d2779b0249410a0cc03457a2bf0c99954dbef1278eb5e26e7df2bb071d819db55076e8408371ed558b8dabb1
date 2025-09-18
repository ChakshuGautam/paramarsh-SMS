import * as React from 'react';
import type { ReactElement, ElementType, ReactNode } from 'react';
import { type ComponentsOverrides, type SxProps, type Theme } from '@mui/material';
import { ShowControllerResult } from 'ra-core';
import { ShowProps } from './Show';
export declare const ShowView: (props: ShowViewProps) => React.JSX.Element | null;
export interface ShowViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'title'> {
    actions?: ReactElement | false;
    aside?: ReactElement;
    component?: ElementType;
    emptyWhileLoading?: boolean;
    title?: string | ReactElement | false;
    sx?: SxProps<Theme>;
    render?: (showContext: ShowControllerResult) => ReactNode;
}
export declare const ShowClasses: {
    main: string;
    noActions: string;
    card: string;
};
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaShow: 'root' | 'main' | 'noActions' | 'card';
    }
    interface ComponentsPropsList {
        RaShow: Partial<ShowProps>;
    }
    interface Components {
        RaShow?: {
            defaultProps?: ComponentsPropsList['RaShow'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaShow'];
        };
    }
}
//# sourceMappingURL=ShowView.d.ts.map