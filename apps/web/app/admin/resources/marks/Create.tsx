"use client";

import { 
  Create, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  TextInput,
  BooleanInput,
  SelectInput,
} from "@/components/admin";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Component to handle conditional rendering of marks fields
const MarksFields = () => {
  const { watch } = useFormContext();
  const isAbsent = watch("isAbsent");
  
  if (isAbsent) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NumberInput 
        source="theoryMarks" 
        label="Theory Marks" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Marks obtained in theory examination"
      />
      <NumberInput 
        source="practicalMarks" 
        label="Practical Marks" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Marks obtained in practical/lab examination"
      />
      <NumberInput 
        source="projectMarks" 
        label="Project Marks" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Marks for project work/assignments"
      />
      <NumberInput 
        source="internalMarks" 
        label="Internal Assessment" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Internal assessment/class test marks"
      />
      <NumberInput 
        source="totalMarks" 
        label="Total Marks (Override)" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Leave empty to auto-calculate from components"
      />
      <SelectInput
        source="grade"
        label="Grade (Optional)"
        choices={[
          { id: 'A+', name: 'A+ (Outstanding)' },
          { id: 'A', name: 'A (Excellent)' },
          { id: 'B+', name: 'B+ (Very Good)' },
          { id: 'B', name: 'B (Good)' },
          { id: 'C+', name: 'C+ (Above Average)' },
          { id: 'C', name: 'C (Average)' },
          { id: 'D', name: 'D (Below Average)' },
          { id: 'F', name: 'F (Fail)' },
        ]}
        fullWidth
        helperText="Grade will be auto-assigned based on marks if not specified"
      />
    </div>
  );
};

export const MarksCreate = () => (
  <Create>
    <SimpleForm>
      <div className="w-full flex flex-col gap-6">
        {/* Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Exam & Student Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReferenceInput source="examId" reference="exams">
              <AutocompleteInput 
                label="Exam" 
                optionText="name" 
                fullWidth 
                helperText="Select the exam for which marks are being entered"
              />
            </ReferenceInput>
            <ReferenceInput source="subjectId" reference="subjects">
              <AutocompleteInput 
                label="Subject" 
                optionText="name" 
                fullWidth 
                helperText="Select the subject"
              />
            </ReferenceInput>
            <ReferenceInput source="studentId" reference="students">
              <AutocompleteInput 
                label="Student" 
                optionText={(record: any) => `${record.firstName} ${record.lastName} (${record.admissionNo || 'N/A'})`}
                fullWidth 
                helperText="Select the student"
              />
            </ReferenceInput>
          </CardContent>
        </Card>

        {/* Marks Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Marks Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <BooleanInput 
                source="isAbsent" 
                label="Mark as Absent" 
                helperText="Check if the student was absent for this exam"
              />
            </div>
            
            <MarksFields />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TextInput 
              source="remarks" 
              label="Remarks/Comments" 
              multiline
              rows={3}
              fullWidth 
              helperText="Any additional comments about the student's performance"
            />
            <div className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The total marks will be automatically calculated from the sum of all component marks if not explicitly provided.
                  The system will check for duplicate entries for the same exam-subject-student combination.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleForm>
  </Create>
);

export default MarksCreate;