import React from 'react';
import { ResourceContextProvider } from '../../core';
import { ListContextProvider } from '../list/ListContextProvider';
import { useReferenceManyFieldController, } from './useReferenceManyFieldController';
/**
 * Render related records to the current one.
 *
 * You must define the fields to be passed to the iterator component as children.
 *
 * @example Display all the comments of the current post as a datagrid
 * <ReferenceManyFieldBase reference="comments" target="post_id">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="body" />
 *         <DateField source="created_at" />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceManyFieldBase>
 *
 * @example Display all the books by the current author, only the title
 * <ReferenceManyFieldBase reference="books" target="author_id">
 *     <SingleFieldList>
 *         <ChipField source="title" />
 *     </SingleFieldList>
 * </ReferenceManyFieldBase>
 *
 * By default, restricts the displayed values to 25. You can extend this limit
 * by setting the `perPage` prop.
 *
 * @example
 * <ReferenceManyFieldBase perPage={10} reference="comments" target="post_id">
 *    ...
 * </ReferenceManyFieldBase>
 *
 * By default, orders the possible values by id desc. You can change this order
 * by setting the `sort` prop (an object with `field` and `order` properties).
 *
 * @example
 * <ReferenceManyFieldBase sort={{ field: 'created_at', order: 'DESC' }} reference="comments" target="post_id">
 *    ...
 * </ReferenceManyFieldBase>
 *
 * Also, you can filter the query used to populate the possible values. Use the
 * `filter` prop for that.
 *
 * @example
 * <ReferenceManyFieldBase filter={{ is_published: true }} reference="comments" target="post_id">
 *    ...
 * </ReferenceManyFieldBase>
 */
export var ReferenceManyFieldBase = function (props) {
    var children = props.children, render = props.render, debounce = props.debounce, empty = props.empty, error = props.error, loading = props.loading, _a = props.filter, filter = _a === void 0 ? defaultFilter : _a, _b = props.page, page = _b === void 0 ? 1 : _b, _c = props.perPage, perPage = _c === void 0 ? 25 : _c, record = props.record, reference = props.reference, resource = props.resource, _d = props.sort, sort = _d === void 0 ? defaultSort : _d, _e = props.source, source = _e === void 0 ? 'id' : _e, storeKey = props.storeKey, target = props.target, queryOptions = props.queryOptions;
    var controllerProps = useReferenceManyFieldController({
        debounce: debounce,
        filter: filter,
        page: page,
        perPage: perPage,
        record: record,
        reference: reference,
        resource: resource,
        sort: sort,
        source: source,
        storeKey: storeKey,
        target: target,
        queryOptions: queryOptions,
    });
    if (!render && !children) {
        throw new Error("<ReferenceManyFieldBase> requires either a 'render' prop or 'children' prop");
    }
    if (controllerProps.isPending && loading) {
        return (React.createElement(ResourceContextProvider, { value: reference }, loading));
    }
    if (controllerProps.error && error) {
        return (React.createElement(ResourceContextProvider, { value: reference },
            React.createElement(ListContextProvider, { value: controllerProps }, error)));
    }
    if (
    // there is an empty page component
    empty &&
        // there is no error
        !controllerProps.error &&
        // the list is not loading data for the first time
        !controllerProps.isPending &&
        // the API returned no data (using either normal or partial pagination)
        (controllerProps.total === 0 ||
            (controllerProps.total == null &&
                // @ts-ignore FIXME total may be undefined when using partial pagination but the ListControllerResult type is wrong about it
                controllerProps.hasPreviousPage === false &&
                // @ts-ignore FIXME total may be undefined when using partial pagination but the ListControllerResult type is wrong about it
                controllerProps.hasNextPage === false &&
                // @ts-ignore FIXME total may be undefined when using partial pagination but the ListControllerResult type is wrong about it
                controllerProps.data.length === 0)) &&
        // the user didn't set any filters
        !Object.keys(controllerProps.filterValues).length) {
        return (React.createElement(ResourceContextProvider, { value: reference }, empty));
    }
    return (React.createElement(ResourceContextProvider, { value: reference },
        React.createElement(ListContextProvider, { value: controllerProps }, render ? render(controllerProps) : children)));
};
var defaultFilter = {};
var defaultSort = { field: 'id', order: 'DESC' };
//# sourceMappingURL=ReferenceManyFieldBase.js.map