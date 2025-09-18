import { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { type ComponentsOverrides, type SxProps, type Theme } from '@mui/material/styles';
export declare const TabbedFormView: (inProps: TabbedFormViewProps) => ReactElement;
export interface TabbedFormViewProps {
    children?: ReactNode;
    className?: string;
    component?: ComponentType<any>;
    resource?: string;
    formRootPathname?: string;
    syncWithLocation?: boolean;
    tabs?: ReactElement;
    toolbar?: ReactElement | false;
    sx?: SxProps<Theme>;
}
export declare const TabbedFormClasses: {
    errorTabButton: string;
};
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaTabbedForm: 'root' | 'errorTabButton';
    }
    interface ComponentsPropsList {
        RaTabbedForm: Partial<TabbedFormViewProps>;
    }
    interface Components {
        RaTabbedForm?: {
            defaultProps?: ComponentsPropsList['RaTabbedForm'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaTabbedForm'];
        };
    }
}
//# sourceMappingURL=TabbedFormView.d.ts.map