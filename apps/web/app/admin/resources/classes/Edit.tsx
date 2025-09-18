"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  required
} from "@/components/admin";
import { 
  ReferenceManyField,
  Datagrid,
  TextField,
  FunctionField,
  Labeled,
  ReferenceField
} from "react-admin";

export const ClassesEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="name" 
          label="Class Name" 
          placeholder="e.g. Class 10, Pre-KG, Nursery"
          validate={required()}
        />
        <NumberInput 
          source="gradeLevel" 
          label="Grade Level" 
          placeholder="e.g. 10 (for Class 10)"
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="branches" source="branchId" label="Branch">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for branch (e.g. DPS Main Campus)"
            validate={required()}
          />
        </ReferenceInput>
        <NumberInput 
          source="capacity" 
          label="Maximum Capacity" 
          placeholder="e.g. 40"
        />
      </div>

      <TextInput 
        source="description" 
        label="Description" 
        placeholder="e.g. Senior secondary students preparing for board exams"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Sections" className="col-span-full">
        <ReferenceManyField reference="sections" target="classId">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="name" label="Section Name" />
            <TextField source="capacity" label="Capacity" />
            <ReferenceField source="homeroomTeacherId" reference="teachers" label="Homeroom Teacher">
              <FunctionField
                render={(record: any) => {
                  if (!record?.staff) return '-';
                  return `${record.staff.firstName} ${record.staff.lastName}`;
                }}
              />
            </ReferenceField>
          </Datagrid>
        </ReferenceManyField>
      </Labeled>

      <Labeled label="Subjects" className="col-span-full">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Subjects are managed at the section level through the Timetable module. 
            To view subjects for this class, check the timetable for each section above.
          </p>
        </div>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default ClassesEdit;