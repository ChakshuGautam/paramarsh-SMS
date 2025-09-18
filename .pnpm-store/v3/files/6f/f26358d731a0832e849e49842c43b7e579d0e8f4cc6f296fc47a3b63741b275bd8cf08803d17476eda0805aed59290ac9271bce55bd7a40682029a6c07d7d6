import * as React from 'react';
import { Exporter } from 'ra-core';
import { ComponentsOverrides } from '@mui/material/styles';
import { ButtonProps } from './Button';
/**
 * Export the selected rows
 *
 * To be used inside the <Datagrid bulkActionButtons> prop.
 *
 * @example // basic usage
 * import { BulkDeleteButton, BulkExportButton, List, Datagrid } from 'react-admin';
 *
 * const PostBulkActionButtons = () => (
 *     <>
 *         <BulkExportButton />
 *         <BulkDeleteButton />
 *     </>
 * );
 *
 * export const PostList = () => (
 *     <List>
 *        <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
 *          ...
 *       </Datagrid>
 *     </List>
 * );
 */
export declare const BulkExportButton: (inProps: BulkExportButtonProps) => React.JSX.Element;
interface Props {
    exporter?: Exporter;
    icon?: React.ReactNode;
    label?: string;
    onClick?: (e: Event) => void;
    resource?: string;
    meta?: any;
}
export type BulkExportButtonProps = Props & ButtonProps;
declare const PREFIX = "RaBulkExportButton";
declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        [PREFIX]: 'root';
    }
    interface ComponentsPropsList {
        [PREFIX]: Partial<BulkExportButtonProps>;
    }
    interface Components {
        [PREFIX]?: {
            defaultProps?: ComponentsPropsList[typeof PREFIX];
            styleOverrides?: ComponentsOverrides<Omit<Theme, 'components'>>[typeof PREFIX];
        };
    }
}
export {};
//# sourceMappingURL=BulkExportButton.d.ts.map