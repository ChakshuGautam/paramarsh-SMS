"use client";

import { 
  Show, 
  SimpleShowLayout,
  TextField,
  ReferenceField,
} from "@/components/admin";
import { useRecordContext } from "react-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Clock, 
  BookOpen,
  CheckCircle,
  XCircle,
  Timer,
  UserX,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

const SessionDetails = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(record.date)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Time Slot</p>
          <p className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {record.period?.timeSlot?.name || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Subject</p>
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <ReferenceField source="subjectId" reference="subjects" link={false}>
              <TextField source="name" />
            </ReferenceField>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Class & Section</p>
          <div className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            <ReferenceField source="sectionId" reference="sections" link={false}>
              <span>
                <TextField source="class.name" /> - <TextField source="name" />
              </span>
            </ReferenceField>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AttendanceSummary = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  // Mock attendance data - in real app, this would come from the API
  const stats = {
    present: record.studentRecords?.filter((r: any) => r.status === 'present').length || 0,
    absent: record.studentRecords?.filter((r: any) => r.status === 'absent').length || 0,
    late: record.studentRecords?.filter((r: any) => r.status === 'late').length || 0,
    excused: record.studentRecords?.filter((r: any) => r.status === 'excused').length || 0,
    total: record.studentRecords?.length || 0,
  };
  
  const attendanceRate = stats.total > 0 
    ? ((stats.present + stats.late) / stats.total * 100).toFixed(1)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.present}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{stats.absent}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Timer className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{stats.late}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UserX className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.excused}</p>
            <p className="text-sm text-muted-foreground">Excused</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-2xl font-bold">{attendanceRate}%</p>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TeacherInfo = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Assigned Teacher</p>
          <ReferenceField source="assignedTeacherId" reference="teachers" link>
            <span className="font-medium">
              <TextField source="staff.firstName" /> <TextField source="staff.lastName" />
            </span>
          </ReferenceField>
        </div>
        {record.actualTeacherId && record.actualTeacherId !== record.assignedTeacherId && (
          <div>
            <p className="text-sm text-muted-foreground">Substitute Teacher</p>
            <ReferenceField source="actualTeacherId" reference="teachers" link>
              <span className="font-medium">
                <TextField source="staff.firstName" /> <TextField source="staff.lastName" />
              </span>
            </ReferenceField>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge className={
            record.status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }>
            {record.status}
          </Badge>
        </div>
        {record.lockedAt && (
          <div>
            <p className="text-sm text-muted-foreground">Locked At</p>
            <p className="font-medium">
              {formatDateTime(record.lockedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AttendanceSessionsShow = () => (
  <Show>
    <SimpleShowLayout>
      <SessionDetails />
      <AttendanceSummary />
      <TeacherInfo />
    </SimpleShowLayout>
  </Show>
);

export default AttendanceSessionsShow;