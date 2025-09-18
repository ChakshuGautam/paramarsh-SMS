import * as React from 'react';
import { ReactNode } from 'react';
import { ListControllerProps, ListControllerResult } from './useListController';
import { RaRecord } from '../../types';
/**
 * Call useListController and put the value in a ListContext
 *
 * Base class for <List> components, without UI.
 *
 * Accepts any props accepted by useListController:
 * - filter: permanent filter applied to the list
 * - filters: Filter element, to display the filters
 * - filterDefaultValues: object;
 * - perPage: Number of results per page
 * - sort: Default sort
 * - exporter: exported function
 *
 * @example // Custom list layout
 *
 * const PostList = () => (
 *     <ListBase perPage={10}>
 *         <div>
 *              List metrics...
 *         </div>
 *         <Grid container>
 *             <Grid item xs={8}>
 *                 <SimpleList primaryText={record => record.title} />
 *             </Grid>
 *             <Grid item xs={4}>
 *                 List instructions...
 *             </Grid>
 *         </Grid>
 *         <div>
 *             Post related links...
 *         </div>
 *     </ListBase>
 * );
 */
export declare const ListBase: <RecordType extends RaRecord = any>({ children, render, loading, ...props }: ListBaseProps<RecordType>) => string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null;
export interface ListBaseProps<RecordType extends RaRecord = any> extends ListControllerProps<RecordType> {
    children?: ReactNode;
    render?: (props: ListControllerResult<RecordType, Error>) => ReactNode;
    loading?: ReactNode;
}
//# sourceMappingURL=ListBase.d.ts.map