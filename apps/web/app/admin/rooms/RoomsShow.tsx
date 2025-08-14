import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const RoomsShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="building" />
        <TextField source="floor" />
        <TextField source="capacity" />
        <TextField source="type" />
        <TextField source="facilities" />
        <TextField source="isActive" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};