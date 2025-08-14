import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TimetableCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="sectionId" required />
        <TextInput source="subjectId" required />
        <TextInput source="teacherId" required />
        <TextInput source="roomId" />
        <TextInput source="timeSlotId" required />
        <TextInput source="isActive" />
        <TextInput source="effectiveFrom" />
      </SimpleForm>
    </Create>
  );
};