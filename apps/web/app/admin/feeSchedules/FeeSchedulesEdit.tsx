import {
  Edit,
  SimpleForm,
  TextInput,
<<<<<<< HEAD
  SelectInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  required,
  minValue,
  maxValue
} from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FeeSchedulesEdit = () => {
  const recurrenceChoices = [
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' },
    { id: 'annually', name: 'Annually' },
    { id: 'semester', name: 'Semester' },
  ];

  const statusChoices = [
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'expired', name: 'Expired' },
  ];

  return (
    <Edit>
      <SimpleForm>
        <Card>
          <CardHeader>
            <CardTitle>Edit Fee Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReferenceInput
              source="feeStructureId"
              reference="feeStructures"
              validate={required()}
              label="Fee Structure"
            >
              <SelectInput source="feeStructureId" optionText="name" />
            </ReferenceInput>
            
            <SelectInput
              source="recurrence"
              choices={recurrenceChoices}
              validate={required()}
              label="Recurrence"
            />
            
            <NumberInput
              source="dueDayOfMonth"
              validate={[required(), minValue(1), maxValue(31)]}
              label="Due Day of Month"
              helperText="Enter the day of the month when fees are due (1-31)"
            />
            
            <DateInput
              source="startDate"
              validate={required()}
              label="Start Date"
            />
            
            <DateInput
              source="endDate"
              validate={required()}
              label="End Date"
            />
            
            <ReferenceInput
              source="classId"
              reference="classes"
              label="Class"
            >
              <SelectInput source="classId" optionText="name" />
            </ReferenceInput>
            
            <ReferenceInput
              source="sectionId"
              reference="sections"
              label="Section (Optional)"
            >
              <SelectInput source="sectionId" optionText="name" />
            </ReferenceInput>
            
            <SelectInput
              source="status"
              choices={statusChoices}
              validate={required()}
              label="Status"
            />
          </CardContent>
        </Card>
=======
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
>>>>>>> origin/main
      </SimpleForm>
    </Edit>
  );
};