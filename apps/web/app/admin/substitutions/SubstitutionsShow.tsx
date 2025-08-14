import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const SubstitutionsShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="periodId" />
        <TextField source="date" />
        <TextField source="substituteTeacherId" />
        <TextField source="substituteRoomId" />
        <TextField source="reason" />
        <TextField source="status" />
        <TextField source="approvedBy" />
        <TextField source="approvedAt" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};