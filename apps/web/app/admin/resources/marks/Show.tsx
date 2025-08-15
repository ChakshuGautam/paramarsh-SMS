"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField, 
  BooleanField,
  NumberField,
  ReferenceField,
} from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecordContext } from "ra-core";

export const MarksShow = () => (
  <Show>
    <SimpleShowLayout>
      <Card>
        <CardHeader>
          <CardTitle>Mark Entry Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Exam</label>
            <ReferenceField source="examId" reference="exams" link>
              <TextField source="name" />
            </ReferenceField>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <ReferenceField source="subjectId" reference="subjects" link>
              <TextField source="name" />
            </ReferenceField>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Student</label>
            <ReferenceField source="studentId" reference="students" link>
              <span>
                <TextField source="firstName" /> <TextField source="lastName" />
              </span>
            </ReferenceField>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <StatusBadge />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Marks Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Theory Marks</label>
            <NumberField source="theoryMarks" options={{ useGrouping: false }} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Practical Marks</label>
            <NumberField source="practicalMarks" options={{ useGrouping: false }} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project Marks</label>
            <NumberField source="projectMarks" options={{ useGrouping: false }} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Internal Assessment</label>
            <NumberField source="internalMarks" options={{ useGrouping: false }} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Total Marks</label>
            <div className="text-2xl font-bold">
              <NumberField source="totalMarks" options={{ useGrouping: false }} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Grade</label>
            <GradeBadge />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Remarks</label>
            <TextField source="remarks" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Evaluated By</label>
              <TextField source="evaluatedBy" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Evaluated At</label>
              <TextField source="evaluatedAt" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <TextField source="createdAt" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <TextField source="updatedAt" />
            </div>
          </div>
        </CardContent>
      </Card>
    </SimpleShowLayout>
  </Show>
);

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isAbsent) {
    return <Badge variant="destructive">Absent</Badge>;
  }
  
  if (record.evaluatedAt) {
    return <Badge variant="secondary">Evaluated</Badge>;
  }
  
  return <Badge variant="outline">Pending</Badge>;
};

const GradeBadge = () => {
  const record = useRecordContext();
  if (!record?.grade) return <span className="text-muted-foreground">Not Graded</span>;
  
  const gradeColors: Record<string, string> = {
    'A+': 'bg-green-100 text-green-700',
    'A': 'bg-green-100 text-green-700',
    'B+': 'bg-blue-100 text-blue-700',
    'B': 'bg-blue-100 text-blue-700',
    'C+': 'bg-yellow-100 text-yellow-700',
    'C': 'bg-yellow-100 text-yellow-700',
    'D': 'bg-orange-100 text-orange-700',
    'F': 'bg-red-100 text-red-700',
  };
  
  const color = gradeColors[record.grade] || 'bg-gray-100 text-gray-700';
  
  return (
    <Badge className={`${color} text-lg px-3 py-1`}>
      {record.grade}
    </Badge>
  );
};

export default MarksShow;
