"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  NumberInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required
} from "@/components/admin";
import { 
  ArrayField,
  Datagrid,
  TextField,
  FunctionField,
  Labeled
} from "react-admin";

export const SectionsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="classes" source="classId" label="Class">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for class (e.g. Class 10)"
            validate={required()}
          />
        </ReferenceInput>
        <TextInput 
          source="name" 
          label="Section Name" 
          placeholder="e.g. Section A, Section B, Alpha"
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput 
          source="capacity" 
          label="Maximum Capacity" 
          placeholder="e.g. 40"
          validate={required()}
        />
        <ReferenceInput reference="teachers" source="homeroomTeacherId" label="Class Teacher">
          <AutocompleteInput 
            optionText={(record: any) => {
              if (!record.staff) return record.id || 'Unknown';
              return `${record.staff.firstName} ${record.staff.lastName} (${record.staff.employeeId})`;
            }}
            placeholder="Search for teacher (e.g. Dr. Rajesh Kumar)"
          />
        </ReferenceInput>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="room" 
          label="Room Number" 
          placeholder="e.g. A-101, Room 205"
        />
        <SelectInput 
          source="isActive" 
          label="Status" 
          placeholder="Select status"
          choices={[
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' }
          ]}
          validate={required()}
        />
      </div>

      <TextInput 
        source="description" 
        label="Description" 
        placeholder="e.g. Science stream section with advanced mathematics"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Current Students" className="col-span-full">
        <ArrayField source="enrollments">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Student Name"
              render={(record: any) => {
                if (!record.student) return '-';
                return `${record.student.firstName} ${record.student.lastName}`;
              }}
            />
            <FunctionField
              label="Admission No"
              render={(record: any) => {
                if (!record.student) return '-';
                return record.student.admissionNo || '-';
              }}
            />
            <FunctionField
              label="Roll Number"
              render={(record: any) => {
                if (!record.student) return '-';
                return record.student.rollNumber || '-';
              }}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'active' ? 'text-green-600 font-medium' : 
                  record.status === 'inactive' ? 'text-gray-400' :
                  'text-yellow-600 font-medium'
                }>
                  {record.status || 'Unknown'}
                </span>
              )}
            />
            <FunctionField
              label="Enrollment Date"
              className="hidden sm:table-cell"
              render={(record: any) => {
                if (!record.enrollmentDate) return '-';
                return new Date(record.enrollmentDate).toLocaleDateString('en-IN');
              }}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>

      <Labeled label="Subject Assignments" className="col-span-full">
        <ArrayField source="assignments">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Subject"
              render={(record: any) => {
                return record.subject?.name || '-';
              }}
            />
            <FunctionField
              label="Teacher"
              render={(record: any) => {
                if (!record.teacher?.staff) return '-';
                const staff = record.teacher.staff;
                return `${staff.firstName} ${staff.lastName}`;
              }}
            />
            <FunctionField
              label="Academic Year"
              className="hidden sm:table-cell"
              render={(record: any) => {
                return record.academicYear?.name || '-';
              }}
            />
            <FunctionField
              label="Class Teacher"
              render={(record: any) => (
                <span className={record.isClassTeacher ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {record.isClassTeacher ? 'Yes' : 'No'}
                </span>
              )}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                }>
                  {record.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default SectionsEdit;