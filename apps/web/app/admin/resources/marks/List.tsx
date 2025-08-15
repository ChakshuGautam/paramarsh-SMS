"use client";

import { useRecordContext } from "ra-core";
import {
  List,
  DataTable,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  BooleanInput,
} from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  FileText,
  User,
  BookOpen
} from "lucide-react";

const marksFilters = [
  <TextInput source="q" placeholder="Search student or subject..." label="" alwaysOn />,
  <ReferenceInput source="examId" reference="exams" label="">
    <AutocompleteInput placeholder="Filter by exam" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="subjectId" reference="subjects" label="">
    <AutocompleteInput placeholder="Filter by subject" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="studentId" reference="students" label="">
    <AutocompleteInput 
      placeholder="Filter by student" 
      optionText={(record: any) => `${record.firstName} ${record.lastName}`} 
    />
  </ReferenceInput>,
  <BooleanInput source="isAbsent" label="Show Absent Only" />,
];

export const MarksList = () => (
  <List
    filters={marksFilters}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={10}
  >
    <MarksTable />
  </List>
);

const MarksTable = () => (
  <DataTable>
    <DataTable.Col label="Student">
      <StudentDisplay />
    </DataTable.Col>
    <DataTable.Col label="Exam">
      <ExamDisplay />
    </DataTable.Col>
    <DataTable.Col label="Subject">
      <SubjectDisplay />
    </DataTable.Col>
    <DataTable.Col source="totalMarks" label="Total Marks">
      <MarksDisplay />
    </DataTable.Col>
    <DataTable.Col source="grade" label="Grade">
      <GradeDisplay />
    </DataTable.Col>
    <DataTable.Col source="isAbsent" label="Status">
      <StatusDisplay />
    </DataTable.Col>
    <DataTable.Col source="remarks" label="Remarks" className="hidden lg:table-cell">
      <RemarksDisplay />
    </DataTable.Col>
  </DataTable>
);

const StudentDisplay = () => {
  const record = useRecordContext();
  if (!record?.student) return null;
  
  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="font-medium">
          {record.student.firstName} {record.student.lastName}
        </div>
        {record.student.rollNumber && (
          <div className="text-xs text-muted-foreground">
            Roll: {record.student.rollNumber}
          </div>
        )}
      </div>
    </div>
  );
};

const ExamDisplay = () => {
  const record = useRecordContext();
  if (!record?.exam) return null;
  
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="font-medium">{record.exam.name}</div>
        {record.exam.examType && (
          <Badge variant="outline" className="text-xs mt-1">
            {record.exam.examType.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>
    </div>
  );
};

const SubjectDisplay = () => {
  const record = useRecordContext();
  if (!record?.subject) return null;
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="font-medium">{record.subject.name}</div>
        {record.subject.code && (
          <div className="text-xs text-muted-foreground">
            Code: {record.subject.code}
          </div>
        )}
      </div>
    </div>
  );
};

const MarksDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isAbsent) {
    return <Badge variant="outline">Absent</Badge>;
  }
  
  const maxMarks = record.exam?.maxMarks || 100;
  const percentage = record.totalMarks ? (record.totalMarks / maxMarks) * 100 : 0;
  const passingMarks = record.exam?.minPassingMarks || 35;
  const isPassing = record.totalMarks >= passingMarks;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isPassing ? 'text-green-700' : 'text-red-700'}`}>
          {record.totalMarks || 0} / {maxMarks}
        </span>
        {isPassing ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {percentage.toFixed(1)}%
      </div>
      {/* Show breakdown if available */}
      {(record.theoryMarks || record.practicalMarks || record.projectMarks || record.internalMarks) && (
        <div className="text-xs text-muted-foreground mt-1">
          {record.theoryMarks && <span>Theory: {record.theoryMarks} </span>}
          {record.practicalMarks && <span>Practical: {record.practicalMarks} </span>}
          {record.projectMarks && <span>Project: {record.projectMarks} </span>}
          {record.internalMarks && <span>Internal: {record.internalMarks}</span>}
        </div>
      )}
    </div>
  );
};

const GradeDisplay = () => {
  const record = useRecordContext();
  if (!record?.grade) return <span className="text-muted-foreground">-</span>;
  
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
    <Badge className={`${color} flex items-center gap-1 w-fit`}>
      {record.grade.startsWith('A') && <Trophy className="h-3 w-3" />}
      {record.grade.startsWith('B') && <Award className="h-3 w-3" />}
      {record.grade}
    </Badge>
  );
};

const StatusDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isAbsent) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
        <AlertCircle className="h-3 w-3" />
        Absent
      </Badge>
    );
  }
  
  if (record.evaluatedAt) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <CheckCircle className="h-3 w-3" />
        Evaluated
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="w-fit">
      Pending
    </Badge>
  );
};

const RemarksDisplay = () => {
  const record = useRecordContext();
  if (!record?.remarks) return <span className="text-muted-foreground">-</span>;
  
  return (
    <span className="text-sm line-clamp-2">
      {record.remarks}
    </span>
  );
};

export default MarksList;