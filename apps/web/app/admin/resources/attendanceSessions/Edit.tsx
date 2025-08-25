"use client";

import { useState, useEffect } from "react";
import { 
  Edit, 
  SimpleForm,
  TextField,
  ReferenceField,
} from "@/components/admin";
import {
  useRecordContext,
  useDataProvider,
  useNotify,
  useRefresh,
} from "react-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Calendar, 
  Clock, 
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Activity,
  UserX,
  Save,
} from "lucide-react";
<<<<<<< HEAD
import { formatDate } from "@/lib/utils";
=======
import { format } from "date-fns";
>>>>>>> origin/main

// Component to display session info
const SessionInfo = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
<<<<<<< HEAD
            <p className="font-medium">{formatDate(record.date)}</p>
=======
            <p className="font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
>>>>>>> origin/main
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{record.period?.timeSlot?.name || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Subject</p>
            <ReferenceField source="subjectId" reference="subjects" link={false}>
              <TextField source="name" />
            </ReferenceField>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Class & Section</p>
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

// Main attendance marking component
const AttendanceTable = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (record?.sectionId) {
      loadStudentsAndAttendance();
    }
  }, [record?.id, record?.sectionId]);
  
  const loadStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      
      // Load students enrolled in this section
      const enrollmentsResponse = await dataProvider.getList('enrollments', {
        filter: { sectionId: record.sectionId, status: 'active' },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'student.rollNumber', order: 'ASC' },
      });
      
      // Load existing attendance records for this session
      const attendanceResponse = await dataProvider.getList('studentPeriodAttendance', {
        filter: { sessionId: record.id },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
      });
      
      // Map attendance records by student ID
      const attendanceMap: Record<string, any> = {};
      attendanceResponse.data.forEach((record: any) => {
        attendanceMap[record.studentId] = record;
      });
      
      setStudents(enrollmentsResponse.data);
      setAttendance(attendanceMap);
    } catch (error) {
      notify('Error loading students', { type: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        studentId,
        sessionId: record.id,
      }
    }));
  };
  
  const handleLateMinutesChange = (studentId: string, minutesLate: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        minutesLate: parseInt(minutesLate) || 0,
      }
    }));
  };
  
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      }
    }));
  };
  
  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      // Prepare attendance records
      const attendanceRecords = Object.values(attendance).filter(a => a.status);
      
      // Save each attendance record
      for (const record of attendanceRecords) {
        if (record.id) {
          // Update existing record
          await dataProvider.update('studentPeriodAttendance', {
            id: record.id,
            data: record,
            previousData: record,
          });
        } else {
          // Create new record
          await dataProvider.create('studentPeriodAttendance', {
            data: {
              ...record,
              markedAt: new Date().toISOString(),
            },
          });
        }
      }
      
      // Update session status to completed if all students marked
      if (attendanceRecords.length === students.length) {
        await dataProvider.update('attendanceSessions', {
          id: record.id,
          data: { status: 'completed', lockedAt: new Date().toISOString() },
          previousData: record,
        });
      }
      
      notify('Attendance saved successfully', { type: 'success' });
      refresh();
    } catch (error) {
      notify('Error saving attendance', { type: 'error' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const markAllPresent = () => {
    const newAttendance: Record<string, any> = {};
    students.forEach(enrollment => {
      newAttendance[enrollment.student.id] = {
        studentId: enrollment.student.id,
        sessionId: record.id,
        status: 'present',
      };
    });
    setAttendance(newAttendance);
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }
  
  if (!students.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students enrolled in this section</p>
        </CardContent>
      </Card>
    );
  }
  
  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mark Attendance</CardTitle>
          <div className="flex gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Present: {presentCount}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              Absent: {absentCount}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3 text-yellow-600" />
              Late: {lateCount}
            </Badge>
            <Button size="sm" variant="outline" onClick={markAllPresent}>
              Mark All Present
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Roll</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead>Late (mins)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((enrollment) => {
              const student = enrollment.student;
              const record = attendance[student.id] || {};
              
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.rollNumber || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {student.photoUrl && (
                        <img 
                          src={student.photoUrl} 
                          alt={student.firstName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{student.admissionNo || '-'}</TableCell>
                  <TableCell>
                    <RadioGroup 
                      value={record.status || ''} 
                      onValueChange={(value) => handleAttendanceChange(student.id, value)}
                      className="flex gap-4 justify-center"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="present" id={`present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`} className="cursor-pointer">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`} className="cursor-pointer">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="late" id={`late-${student.id}`} />
                        <Label htmlFor={`late-${student.id}`} className="cursor-pointer">
                          <Timer className="h-4 w-4 text-yellow-600" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="excused" id={`excused-${student.id}`} />
                        <Label htmlFor={`excused-${student.id}`} className="cursor-pointer">
                          <UserX className="h-4 w-4 text-blue-600" />
                        </Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="60"
                      className="w-20"
                      value={record.minutesLate || ''}
                      onChange={(e) => handleLateMinutesChange(student.id, e.target.value)}
                      disabled={record.status !== 'late'}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      className="w-full min-w-[150px]"
                      rows={1}
                      value={record.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      placeholder="Add notes..."
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={saveAttendance} 
            disabled={saving}
            size="lg"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AttendanceSessionsEdit = () => (
  <Edit>
    <SimpleForm toolbar={false}>
      <SessionInfo />
      <AttendanceTable />
    </SimpleForm>
  </Edit>
);

export default AttendanceSessionsEdit;