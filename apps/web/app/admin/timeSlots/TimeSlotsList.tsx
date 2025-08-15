import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const TimeSlotsList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col source="dayOfWeek" label="Day of Week">
          <TextField source="dayOfWeek" />
        </DataTable.Col>
        <DataTable.Col source="startTime" label="Start Time">
          <TextField source="startTime" />
        </DataTable.Col>
        <DataTable.Col source="endTime" label="End Time">
          <TextField source="endTime" />
        </DataTable.Col>
        <DataTable.Col source="slotType" label="Slot Type">
          <TextField source="slotType" />
        </DataTable.Col>
        <DataTable.Col source="slotOrder" label="Slot Order">
          <TextField source="slotOrder" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};