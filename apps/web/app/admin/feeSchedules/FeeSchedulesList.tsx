import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const FeeSchedulesList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="name" />
        <TextField source="frequency" />
        <TextField source="dueDate" />
        <TextField source="amount" />
        <TextField source="feeStructureId" />
        <TextField source="createdAt" />
      </DataTable>
    </List>
  );
};