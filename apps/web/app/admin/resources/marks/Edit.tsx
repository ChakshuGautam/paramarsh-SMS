"use client";

import { 
  Edit, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  TextInput,
  BooleanInput,
  SelectInput,
  ReferenceField,
  TextField,
} from "@/components/admin";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

// Component to handle conditional rendering of marks fields
const MarksEditFields = () => {
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
        label="Total Marks" 
        min={0}
        step={0.5}
        fullWidth 
        helperText="Total marks (auto-calculated if not provided)"
      />
      <SelectInput
        source="grade"
        label="Grade"
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
        helperText="Grade based on marks"
      />
    </div>
  );
};

export const MarksEdit = () => (
  <Edit>
    <SimpleForm>
      <div className="w-full flex flex-col gap-6">
        {/* Read-only Information */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Exam</label>
              <ReferenceField source="examId" reference="exams" link={false}>
                <TextField source="name" />
              </ReferenceField>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <ReferenceField source="subjectId" reference="subjects" link={false}>
                <TextField source="name" />
              </ReferenceField>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Student</label>
              <ReferenceField source="studentId" reference="students" link={false}>
                <TextField source="firstName" />
              </ReferenceField>
            </div>
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
            
            <MarksEditFields />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluated By</label>
                <TextField source="evaluatedBy" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluated At</label>
                <TextField source="evaluatedAt" />
              </div>
            </div>

            <div className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Note: You cannot change the exam, subject, or student after creation. 
                  If you need to change these, please delete this entry and create a new one.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleForm>
  </Edit>
);

export default MarksEdit;