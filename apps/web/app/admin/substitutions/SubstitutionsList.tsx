import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const SubstitutionsList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="periodId" />
        <TextField source="date" />
        <TextField source="substituteTeacherId" />
        <TextField source="substituteRoomId" />
        <TextField source="reason" />
        <TextField source="status" />
        <TextField source="approvedBy" />
      </DataTable>
    </List>
  );
};