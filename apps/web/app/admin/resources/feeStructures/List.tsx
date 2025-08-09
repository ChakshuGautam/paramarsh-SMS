"use client";

import { List, DataTable, TextField, ArrayField, SingleFieldList } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const FeeStructuresList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Grade">
        <ReferenceField reference="classes" source="gradeId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Components">
        <ArrayField source="components">
          <SingleFieldList
            render={(item: any) => `${item.name} (${item.type ?? ""}) ₹${item.amount}`}
          />
        </ArrayField>
      </DataTable.Col>
    </DataTable>
  </List>
);

export default FeeStructuresList;
