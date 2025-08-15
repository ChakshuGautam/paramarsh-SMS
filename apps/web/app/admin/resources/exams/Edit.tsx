"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  DateInput,
  SelectInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  FormDataConsumer,
} from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ExamsEdit = () => (
  <Edit>
    <SimpleForm>
      <div className="w-full flex flex-col gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput source="name" label="Exam Name" required fullWidth />
            <SelectInput 
              source="examType" 
              label="Exam Type"
              choices={[
                { id: 'UNIT_TEST', name: 'Unit Test' },
                { id: 'MONTHLY_TEST', name: 'Monthly Test' },
                { id: 'QUARTERLY', name: 'Quarterly Exam' },
                { id: 'HALF_YEARLY', name: 'Half Yearly' },
                { id: 'ANNUAL', name: 'Annual/Final' },
                { id: 'BOARD_EXAM', name: 'Board Exam' },
                { id: 'ENTRANCE_EXAM', name: 'Entrance Exam' },
                { id: 'MOCK_TEST', name: 'Mock Test' },
                { id: 'REMEDIAL_TEST', name: 'Remedial Test' },
                { id: 'SURPRISE_TEST', name: 'Surprise Test' },
              ]}
              fullWidth
            />
            <ReferenceInput source="academicYearId" reference="academicYears">
              <AutocompleteInput label="Academic Year" optionText="name" fullWidth />
            </ReferenceInput>
            <SelectInput
              source="term"
              label="Term"
              choices={[
                { id: 1, name: 'Term 1' },
                { id: 2, name: 'Term 2' },
                { id: 3, name: 'Term 3' },
              ]}
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput source="startDate" label="Start Date" fullWidth />
            <DateInput source="endDate" label="End Date" fullWidth />
            <SelectInput
              source="status"
              label="Status"
              choices={[
                { id: 'SCHEDULED', name: 'Scheduled' },
                { id: 'ONGOING', name: 'Ongoing' },
                { id: 'COMPLETED', name: 'Completed' },
                { id: 'CANCELLED', name: 'Cancelled' },
                { id: 'POSTPONED', name: 'Postponed' },
              ]}
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Marks Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Marks Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput 
              source="maxMarks" 
              label="Maximum Marks" 
              min={0}
              step={1}
              fullWidth 
            />
            <NumberInput 
              source="minPassingMarks" 
              label="Minimum Passing Marks" 
              min={0}
              step={1}
              fullWidth 
            />
            <NumberInput 
              source="weightagePercent" 
              label="Weightage (%)" 
              min={0}
              max={100}
              step={0.1}
              helperText="Percentage weightage in final grade calculation"
              fullWidth 
            />
          </CardContent>
        </Card>
      </div>
    </SimpleForm>
  </Edit>
);

export default ExamsEdit;
