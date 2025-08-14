import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const FeeSchedulesEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="frequency" required />
        <TextInput source="dueDate" required />
        <TextInput source="amount" required />
        <TextInput source="feeStructureId" required />
      </SimpleForm>
    </Edit>
  );
};