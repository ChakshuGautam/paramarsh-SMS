import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const PreferencesList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="ownerType" />
        <TextField source="ownerId" />
        <TextField source="channel" />
        <TextField source="consent" />
        <TextField source="quietHours" />
        <TextField source="createdAt" />
      </DataTable>
    </List>
  );
};