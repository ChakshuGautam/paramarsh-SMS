import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const TimetableList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="sectionId" />
        <TextField source="subjectId" />
        <TextField source="teacherId" />
        <TextField source="roomId" />
        <TextField source="timeSlotId" />
        <TextField source="isActive" />
        <TextField source="effectiveFrom" />
      </DataTable>
    </List>
  );
};