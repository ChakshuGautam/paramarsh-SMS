import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TimeSlotsCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="dayOfWeek" required />
        <TextInput source="startTime" required />
        <TextInput source="endTime" required />
        <TextInput source="slotType" />
        <TextInput source="slotOrder" required />
      </SimpleForm>
    </Create>
  );
};