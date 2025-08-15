import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const TenantsList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col source="name" label="Name">
          <TextField source="name" />
        </DataTable.Col>
        <DataTable.Col source="domain" label="Domain">
          <TextField source="domain" />
        </DataTable.Col>
        <DataTable.Col source="status" label="Status">
          <TextField source="status" />
        </DataTable.Col>
        <DataTable.Col source="plan" label="Plan">
          <TextField source="plan" />
        </DataTable.Col>
        <DataTable.Col source="createdAt" label="Created At">
          <TextField source="createdAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};