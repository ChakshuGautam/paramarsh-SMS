"use client";

import { Show, SimpleShowLayout, TextField, ArrayField, SingleFieldList } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const FeeStructuresShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="classes" source="gradeId">
        <TextField source="name" label="Grade" />
      </ReferenceField>
      <ArrayField source="components">
        <SingleFieldList
          render={(item: any) => `${item.name} (${item.type ?? ""}) ₹${item.amount}`}
        />
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default FeeStructuresShow;




