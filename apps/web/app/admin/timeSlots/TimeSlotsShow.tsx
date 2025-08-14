import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const TimeSlotsShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="dayOfWeek" />
        <TextField source="startTime" />
        <TextField source="endTime" />
        <TextField source="slotType" />
        <TextField source="slotOrder" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};