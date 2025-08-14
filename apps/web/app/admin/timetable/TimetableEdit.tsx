import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TimetableEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="sectionId" required />
        <TextInput source="subjectId" required />
        <TextInput source="teacherId" required />
        <TextInput source="roomId" />
        <TextInput source="timeSlotId" required />
        <TextInput source="isActive" />
        <TextInput source="effectiveFrom" />
        <TextInput source="effectiveTo" />
      </SimpleForm>
    </Edit>
  );
};