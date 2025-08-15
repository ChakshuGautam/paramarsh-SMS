import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const SubstitutionsList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col source="periodId" label="Period ID">
          <TextField source="periodId" />
        </DataTable.Col>
        <DataTable.Col source="date" label="Date">
          <TextField source="date" />
        </DataTable.Col>
        <DataTable.Col source="substituteTeacherId" label="Substitute Teacher">
          <TextField source="substituteTeacherId" />
        </DataTable.Col>
        <DataTable.Col source="substituteRoomId" label="Substitute Room">
          <TextField source="substituteRoomId" />
        </DataTable.Col>
        <DataTable.Col source="reason" label="Reason">
          <TextField source="reason" />
        </DataTable.Col>
        <DataTable.Col source="status" label="Status">
          <TextField source="status" />
        </DataTable.Col>
        <DataTable.Col source="approvedBy" label="Approved By">
          <TextField source="approvedBy" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};