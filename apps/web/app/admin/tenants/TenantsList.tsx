import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const TenantsList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="name" />
        <TextField source="domain" />
        <TextField source="status" />
        <TextField source="plan" />
        <TextField source="createdAt" />
      </DataTable>
    </List>
  );
};