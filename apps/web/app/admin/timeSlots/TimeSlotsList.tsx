import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const TimeSlotsList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="dayOfWeek" />
        <TextField source="startTime" />
        <TextField source="endTime" />
        <TextField source="slotType" />
        <TextField source="slotOrder" />
      </DataTable>
    </List>
  );
};