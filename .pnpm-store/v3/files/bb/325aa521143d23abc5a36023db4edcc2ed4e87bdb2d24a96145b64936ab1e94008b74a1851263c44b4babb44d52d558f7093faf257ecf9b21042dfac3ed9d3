import * as React from 'react';
import { type LinkProps as RRLinkProps } from 'react-router-dom';
import { type LinkProps as MuiLinkProps, type ComponentsOverrides } from '@mui/material';
export declare const Link: (inProps: LinkProps) => React.JSX.Element;
export declare const LinkClasses: {
    link: string;
};
export interface LinkProps extends MuiLinkProps<React.ElementType<any>, RRLinkProps> {
    className?: string;
}
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaLink: 'root' | 'link';
    }
    interface ComponentsPropsList {
        RaLink: Partial<LinkProps>;
    }
    interface Components {
        RaLink?: {
            defaultProps?: ComponentsPropsList['RaLink'];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>['RaLink'];
        };
    }
}
//# sourceMappingURL=Link.d.ts.map