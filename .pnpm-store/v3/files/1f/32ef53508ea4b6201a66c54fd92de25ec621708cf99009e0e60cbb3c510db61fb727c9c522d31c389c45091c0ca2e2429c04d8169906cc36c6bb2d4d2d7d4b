import React, { ReactNode } from 'react';
import { UseReferenceOneFieldControllerParams } from './useReferenceOneFieldController';
import type { RaRecord } from '../../types';
import type { LinkToType } from '../../routing';
import { UseReferenceResult } from '../useReference';
/**
 * Render the related record in a one-to-one relationship
 *
 * Expects a single field as child
 *
 * @example // display the bio of the current author
 * <ReferenceOneFieldBase reference="bios" target="author_id">
 *     <TextField source="body" />
 * </ReferenceOneFieldBase>
 */
export declare const ReferenceOneFieldBase: <RecordType extends RaRecord = RaRecord, ReferenceRecordType extends RaRecord = RaRecord>(props: ReferenceOneFieldBaseProps<RecordType, ReferenceRecordType>) => React.JSX.Element;
export interface ReferenceOneFieldBaseProps<RecordType extends RaRecord = RaRecord, ReferenceRecordType extends RaRecord = RaRecord> extends UseReferenceOneFieldControllerParams<RecordType, ReferenceRecordType> {
    children?: ReactNode;
    loading?: ReactNode;
    error?: ReactNode;
    empty?: ReactNode;
    render?: (props: UseReferenceResult<ReferenceRecordType>) => ReactNode;
    link?: LinkToType<ReferenceRecordType>;
    resource?: string;
}
//# sourceMappingURL=ReferenceOneFieldBase.d.ts.map