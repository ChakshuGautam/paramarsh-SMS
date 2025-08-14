import {
  List,
  DataTable,
  TextField,
} from '@/components/admin';

export const RoomsList = () => {
  return (
    <List>
      <DataTable>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="building" />
        <TextField source="floor" />
        <TextField source="capacity" />
        <TextField source="type" />
        <TextField source="isActive" />
      </DataTable>
    </List>
  );
};