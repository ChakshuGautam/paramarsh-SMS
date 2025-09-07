"use client";

import { Show, SimpleShowLayout, TextField, NumberField } from "@/components/admin";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { SingleFieldList } from "@/components/admin/single-field-list";

export const TeachersShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="staff.firstName" label="First Name" />
      <TextField source="staff.lastName" label="Last Name" />
      <TextField source="staff.email" label="Email" />
      <TextField source="staff.phone" label="Phone" />
      <TextField source="staff.designation" label="Designation" />
      <TextField source="subjects" label="Subjects (Text)" />
      <ReferenceArrayField reference="classes" source="classIds" label="Assigned Classes">
        <SingleFieldList>
          <TextField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
      <ReferenceArrayField reference="sections" source="sectionIds" label="Assigned Sections">
        <SingleFieldList>
          <TextField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
      <TextField source="qualifications" label="Qualifications" />
      <NumberField source="experienceYears" label="Experience (years)" />
    </SimpleShowLayout>
  </Show>
);

export default TeachersShow;