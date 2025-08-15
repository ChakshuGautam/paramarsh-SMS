import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const PreferencesList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col source="ownerType" label="Owner Type">
          <TextField source="ownerType" />
        </DataTable.Col>
        <DataTable.Col source="ownerId" label="Owner ID">
          <TextField source="ownerId" />
        </DataTable.Col>
        <DataTable.Col source="channel" label="Channel">
          <TextField source="channel" />
        </DataTable.Col>
        <DataTable.Col source="consent" label="Consent">
          <TextField source="consent" />
        </DataTable.Col>
        <DataTable.Col source="quietHours" label="Quiet Hours">
          <TextField source="quietHours" />
        </DataTable.Col>
        <DataTable.Col source="createdAt" label="Created At">
          <TextField source="createdAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};