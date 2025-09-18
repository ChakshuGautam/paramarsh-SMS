import * as React from 'react';
import { ReferenceFieldContextProvider } from './ReferenceFieldContext';
import { useReferenceFieldController, } from './useReferenceFieldController';
import { ResourceContextProvider } from '../../core';
import { RecordContextProvider } from '../record';
import { useFieldValue } from '../../util';
/**
 * Fetch reference record, and render its representation, or delegate rendering to child component.
 *
 * The reference prop should be the name of one of the <Resource> components
 * added as <Admin> child.
 *
 * @example // using recordRepresentation
 * <ReferenceFieldBase source="userId" reference="users" />
 *
 * @example // using a Field component to represent the record
 * <ReferenceFieldBase source="userId" reference="users">
 *     <TextField source="name" />
 * </ReferenceFieldBase>
 *
 * @example // By default, includes a link to the <Edit> page of the related record
 * // (`/users/:userId` in the previous example).
 * // Set the `link` prop to "show" to link to the <Show> page instead.
 * <ReferenceFieldBase source="userId" reference="users" link="show" />
 *
 * @example // You can also prevent `<ReferenceFieldBase>` from adding link to children
 * // by setting `link` to false.
 * <ReferenceFieldBase source="userId" reference="users" link={false} />
 *
 * @example // Alternatively, you can also pass a custom function to `link`.
 * // It must take reference and record as arguments and return a string
 * <ReferenceFieldBase source="userId" reference="users" link={(record, reference) => "/path/to/${reference}/${record}"} />
 *
 * @default
 * In previous versions of React-Admin, the prop `linkType` was used. It is now deprecated and replaced with `link`. However
 * backward-compatibility is still kept
 */
export var ReferenceFieldBase = function (props) {
    var children = props.children, render = props.render, loading = props.loading, error = props.error, _a = props.empty, empty = _a === void 0 ? null : _a;
    var id = useFieldValue(props);
    var controllerProps = useReferenceFieldController(props);
    if (!render && !children) {
        throw new Error("<ReferenceFieldBase> requires either a 'render' prop or 'children' prop");
    }
    if (controllerProps.isPending && loading) {
        return (React.createElement(ResourceContextProvider, { value: props.reference }, loading));
    }
    if (controllerProps.error && error) {
        return (React.createElement(ResourceContextProvider, { value: props.reference },
            React.createElement(ReferenceFieldContextProvider, { value: controllerProps }, error)));
    }
    if ((empty &&
        // no foreign key value
        !id) ||
        // no reference record
        (!controllerProps.error &&
            !controllerProps.isPending &&
            !controllerProps.referenceRecord)) {
        return (React.createElement(ResourceContextProvider, { value: props.reference }, empty));
    }
    return (React.createElement(ResourceContextProvider, { value: props.reference },
        React.createElement(ReferenceFieldContextProvider, { value: controllerProps },
            React.createElement(RecordContextProvider, { value: controllerProps.referenceRecord }, render ? render(controllerProps) : children))));
};
//# sourceMappingURL=ReferenceFieldBase.js.map