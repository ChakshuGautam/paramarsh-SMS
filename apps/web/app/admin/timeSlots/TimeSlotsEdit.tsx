import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TimeSlotsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="dayOfWeek" required />
        <TextInput source="startTime" required />
        <TextInput source="endTime" required />
        <TextInput source="slotType" />
        <TextInput source="slotOrder" required />
      </SimpleForm>
    </Edit>
  );
};