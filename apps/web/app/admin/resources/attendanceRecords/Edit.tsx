"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
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

export const AttendanceRecordsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="students" source="studentId" label="Student">
          <AutocompleteInput 
            optionText={(record) => `${record.firstName} ${record.lastName} (${record.admissionNo})`}
            placeholder="Search for student (e.g. Rajesh Kumar)"
            validate={required()}
          />
        </ReferenceInput>
        <DateInput 
          source="date" 
          label="Attendance Date" 
          placeholder="Select attendance date"
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="status" 
          label="Attendance Status" 
          placeholder="Select attendance status"
          choices={[
            { id: 'present', name: 'Present' },
            { id: 'absent', name: 'Absent' },
            { id: 'late', name: 'Late' },
            { id: 'excused', name: 'Excused' },
            { id: 'sick', name: 'Sick Leave' },
            { id: 'holiday', name: 'Holiday' }
          ]}
          validate={required()}
        />
        <NumberInput 
          source="minutesLate" 
          label="Minutes Late" 
          placeholder="e.g. 15"
          min={0}
          max={300}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="teachers" source="markedBy" label="Marked By Teacher">
          <AutocompleteInput 
            optionText={(record) => {
              if (!record.staff) return record.id || 'Unknown';
              return `${record.staff.firstName} ${record.staff.lastName} (${record.staff.employeeId})`;
            }}
            placeholder="Search for teacher (e.g. Dr. Rajesh Kumar)"
          />
        </ReferenceInput>
        <DateInput 
          source="markedAt" 
          label="Marked At" 
          placeholder="When was attendance marked"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="source" 
          label="Attendance Source" 
          placeholder="Select how attendance was recorded"
          choices={[
            { id: 'manual', name: 'Manual Entry' },
            { id: 'biometric', name: 'Biometric Scanner' },
            { id: 'rfid', name: 'RFID Card' },
            { id: 'mobile_app', name: 'Mobile App' },
            { id: 'web_portal', name: 'Web Portal' },
            { id: 'bulk_import', name: 'Bulk Import' }
          ]}
        />
        <ReferenceInput reference="attendanceSessions" source="sessionId" label="Attendance Session">
          <AutocompleteInput 
            optionText={(record) => {
              if (!record.subject || !record.section) return `Session ${record.id}`;
              return `${record.subject.name} - ${record.section.class?.name} ${record.section.name} (${new Date(record.date).toLocaleDateString('en-IN')})`;
            }}
            placeholder="Search for session (optional)"
          />
        </ReferenceInput>
      </div>

      <TextInput 
        source="notes" 
        label="Notes" 
        placeholder="e.g. Student was in medical room, Parent informed about absence"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Student Information" className="col-span-full">
        <ArrayField source="student">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <TextField source="admissionNo" label="Admission No" />
            <TextField source="rollNumber" label="Roll Number" />
            <FunctionField
              label="Current Class & Section"
              render={(record: any) => {
                if (!record.class || !record.section) return '-';
                return `${record.class.name} - ${record.section.name}`;
              }}
            />
            <FunctionField
              label="Student Status"
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
          </Datagrid>
        </ArrayField>
      </Labeled>

      <Labeled label="Recent Attendance History" className="col-span-full">
        <ArrayField source="student.attendanceRecords">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Date"
              render={(record: any) => {
                if (!record.date) return '-';
                return new Date(record.date).toLocaleDateString('en-IN');
              }}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'present' ? 'text-green-600 font-medium' : 
                  record.status === 'absent' ? 'text-red-600 font-medium' :
                  record.status === 'late' ? 'text-yellow-600 font-medium' :
                  'text-blue-600 font-medium'
                }>
                  {record.status || 'Unknown'}
                </span>
              )}
            />
            <TextField source="minutesLate" label="Minutes Late" />
            <TextField source="source" label="Source" className="hidden sm:table-cell" />
            <FunctionField
              label="Marked By"
              className="hidden sm:table-cell"
              render={(record: any) => {
                if (!record.markedByTeacher?.staff) return '-';
                const staff = record.markedByTeacher.staff;
                return `${staff.firstName} ${staff.lastName}`;
              }}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default AttendanceRecordsEdit;