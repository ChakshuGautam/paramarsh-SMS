"use client";

import React, { useState, useEffect } from "react";
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
  useGetIdentity,
  useRedirect,
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
  Edit2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Component to display session info and allow status updates
const SessionInfo = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const [updating, setUpdating] = useState(false);
  
  if (!record) return null;
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await dataProvider.update('attendanceSessions', {
        id: record.id,
        data: { 
          ...record,
          status: newStatus,
          lockedAt: newStatus === 'completed' ? new Date().toISOString() : null 
        },
        previousData: record,
      });
      notify('Session status updated', { type: 'success' });
      refresh();
      // Redirect to list after status change to ensure cache is cleared
      setTimeout(() => {
        redirect('list', 'attendanceSessions');
      }, 500);
    } catch (error) {
      notify('Error updating session status', { type: 'error' });
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };
  
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-gray-100 text-gray-700' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Session Information</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <select 
              value={record.status || 'scheduled'} 
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                statusOptions.find(o => o.value === record.status)?.color || 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(record.date)}</p>
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
  const redirect = useRedirect();
  const { data: identity } = useGetIdentity();
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  
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
        // Debug: Log to ensure we have the id field
        if (!record.id) {
          console.warn('Attendance record missing id:', record);
        }
        attendanceMap[record.studentId] = record;
      });
      
      // Debug: Log the loaded attendance data
      console.log('Loaded attendance records:', attendanceResponse.data.length, 'records');
      console.log('Attendance map sample:', Object.entries(attendanceMap).slice(0, 2));
      
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
        ...prev[studentId],  // This preserves the existing id if it exists
        status,
        studentId,
        sessionId: record.id,
        // Explicitly preserve the id and markedBy fields if they exist
        id: prev[studentId]?.id,
        markedBy: prev[studentId]?.markedBy,
      }
    }));
  };
  
  const handleLateMinutesChange = (studentId: string, minutesLate: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        minutesLate: parseInt(minutesLate) || 0,
        // Ensure required fields are preserved
        studentId: prev[studentId]?.studentId || studentId,
        sessionId: prev[studentId]?.sessionId || record.id,
      }
    }));
  };
  
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
        // Ensure required fields are preserved
        studentId: prev[studentId]?.studentId || studentId,
        sessionId: prev[studentId]?.sessionId || record.id,
      }
    }));
  };
  
  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      // Use the teacher assigned to this session
      // If actualTeacherId exists (substitute teacher), use that, otherwise use assignedTeacherId
      const teacherId = record.actualTeacherId || record.assignedTeacherId;
      
      if (!teacherId) {
        notify('Error: No teacher assigned to this session', { type: 'error' });
        setSaving(false);
        return;
      }
      
      // Prepare attendance records
      const attendanceRecords = Object.values(attendance).filter(a => a.status);
      
      // Debug: Log what we're about to save
      console.log('Saving attendance records:', attendanceRecords.length);
      console.log('Sample record:', attendanceRecords[0]);
      
      // Save each attendance record
      for (const record of attendanceRecords) {
        if (record.id) {
          console.log(`Updating existing record ${record.id} for student ${record.studentId}`);
          // Update existing record
          await dataProvider.update('studentPeriodAttendance', {
            id: record.id,
            data: {
              ...record,
              markedBy: record.markedBy || teacherId,
            },
            previousData: record,
          });
        } else {
          console.log(`Creating new record for student ${record.studentId}`);
          // Create new record
          await dataProvider.create('studentPeriodAttendance', {
            data: {
              ...record,
              markedAt: new Date().toISOString(),
              markedBy: teacherId,
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
      // Force a refresh and redirect to list view to ensure cache is cleared
      refresh();
      setTimeout(() => {
        redirect('list', 'attendanceSessions');
      }, 500);
    } catch (error) {
      notify('Error saving attendance', { type: 'error' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const markAllPresent = () => {
    const newAttendance: Record<string, any> = {...attendance};
    students.forEach(enrollment => {
      const studentId = enrollment.student.id;
      newAttendance[studentId] = {
        ...newAttendance[studentId],
        studentId,
        sessionId: record.id,
        status: 'present',
        minutesLate: 0,
      };
    });
    setAttendance(newAttendance);
    notify('All students marked as present', { type: 'info' });
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
                    {showNotes[student.id] ? (
                      <div className="flex gap-1">
                        <Textarea
                          className="w-full min-w-[120px]"
                          rows={1}
                          value={record.notes || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Add notes..."
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNotes(prev => ({ ...prev, [student.id]: false }))}
                        >
                          ✓
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNotes(prev => ({ ...prev, [student.id]: true }))}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        {record.notes ? 'Edit' : 'Add'}
                      </Button>
                    )}
                    {record.notes && !showNotes[student.id] && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[100px]" title={record.notes}>
                        {record.notes}
                      </div>
                    )}
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
    <SimpleForm className="max-w-6xl" toolbar={false}>
      <SessionInfo />
      <AttendanceTable />
    </SimpleForm>
  </Edit>
);

export default AttendanceSessionsEdit;