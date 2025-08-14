'use client';

import React, { useState, useEffect } from 'react';
import { 
  Create, 
  List, 
  DataTable, 
  TextField,
  SelectInput,
  ReferenceInput,
  DateInput,
  SimpleForm
} from '@/components/admin';
import {
  useDataProvider,
  useNotify,
  useRedirect,
  useGetList,
  RecordContextProvider,
} from 'react-admin';
import { Save, Users, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
}

interface AttendanceEntry {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  reason?: string;
}

const AttendanceStatusRadio = ({ 
  student, 
  value, 
  onChange, 
  onReasonChange 
}: { 
  student: Student;
  value: AttendanceEntry;
  onChange: (status: AttendanceEntry['status']) => void;
  onReasonChange: (reason: string) => void;
}) => {
  const statuses: { value: AttendanceEntry['status']; label: string; color: string }[] = [
    { value: 'PRESENT', label: 'P', color: 'text-green-600' },
    { value: 'ABSENT', label: 'A', color: 'text-red-600' },
    { value: 'LATE', label: 'L', color: 'text-yellow-600' },
    { value: 'EXCUSED', label: 'E', color: 'text-blue-600' },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-3">
        {statuses.map((status) => (
          <label 
            key={status.value}
            className="flex items-center gap-1 cursor-pointer"
          >
            <input
              type="radio"
              name={`attendance-${student.id}`}
              value={status.value}
              checked={value.status === status.value}
              onChange={() => onChange(status.value)}
              className={`w-4 h-4 ${status.color} focus:ring-2 focus:ring-offset-2`}
            />
            <span className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </label>
        ))}
      </div>
      <Input
        type="text"
        placeholder="Reason..."
        value={value.reason || ''}
        onChange={(e) => onReasonChange(e.target.value)}
        disabled={value.status === 'PRESENT'}
        className="flex-1 h-8 text-sm"
      />
    </div>
  );
};

const AttendanceRegister = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useGetList('classes', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'gradeLevel', order: 'ASC' },
  });

  // Fetch sections when class is selected
  useEffect(() => {
    if (selectedClass) {
      dataProvider.getList('sections', {
        filter: { classId: selectedClass },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
      }).then(({ data }) => {
        setSections(data);
        setSelectedSection('');
        setStudents([]);
        setAttendance({});
      });
    } else {
      setSections([]);
      setSelectedSection('');
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, dataProvider]);

  // Fetch students when section is selected
  useEffect(() => {
    if (selectedSection) {
      dataProvider.getList('students', {
        filter: { sectionId: selectedSection },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'firstName', order: 'ASC' },
      }).then(({ data }) => {
        setStudents(data);
        // Initialize attendance with all present
        const initialAttendance: Record<string, AttendanceEntry> = {};
        data.forEach((student: Student) => {
          initialAttendance[student.id] = {
            studentId: student.id,
            status: 'PRESENT',
          };
        });
        setAttendance(initialAttendance);
      });
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedSection, dataProvider]);

  const handleAttendanceChange = (studentId: string, status: AttendanceEntry['status']) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason: reason || undefined,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const newAttendance: Record<string, AttendanceEntry> = {};
    students.forEach(student => {
      newAttendance[student.id] = {
        studentId: student.id,
        status: 'PRESENT',
      };
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      notify('Please select class, section and date', { type: 'warning' });
      return;
    }

    setLoading(true);
    
    try {
      // Create new attendance records
      const promises = Object.values(attendance).map(entry =>
        dataProvider.create('attendanceRecords', {
          data: {
            studentId: entry.studentId,
            date: selectedDate,
            status: entry.status,
            reason: entry.reason,
          },
        })
      );

      await Promise.all(promises);
      
      notify(`Attendance saved for ${students.length} students`, { type: 'success' });
      redirect('list', 'attendanceRecords');
    } catch (error) {
      notify('Error saving attendance', { type: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    const summary = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };
    
    Object.values(attendance).forEach(entry => {
      summary[entry.status]++;
    });
    
    return summary;
  };

  const summary = getAttendanceSummary();

  // Transform students to records with attendance for DataTable
  const studentRecords = students.map((student, index) => ({
    ...student,
    rollNo: index + 1,
    attendance: attendance[student.id] || { studentId: student.id, status: 'PRESENT' },
  }));

  return (
    <Create title="Mark Attendance">
      <div className="space-y-6">
        {/* Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Register
            </CardTitle>
            <CardDescription>Mark attendance for students by selecting class, section and date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-end gap-3 flex-wrap">
              <div className="min-w-[180px]">
                <Label htmlFor="class-select" className="text-sm">Filter by Class</Label>
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[120px]">
                <Label htmlFor="section-select" className="text-sm">Filter by Section</Label>
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                >
                  <option value="">Select Section</option>
                  {sections.map((section: any) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[150px]">
                <Label htmlFor="date-input" className="text-sm">Date</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            {students.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Total: {students.length}</Badge>
                <Badge variant="default" className="bg-green-600">Present: {summary.PRESENT}</Badge>
                <Badge variant="destructive">Absent: {summary.ABSENT}</Badge>
                <Badge variant="default" className="bg-yellow-600">Late: {summary.LATE}</Badge>
                <Badge variant="default" className="bg-blue-600">Excused: {summary.EXCUSED}</Badge>
                <div className="flex-grow" />
                <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                  Mark All Present
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student List with DataTable */}
        {students.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={studentRecords}
                bulkActionButtons={false}
                rowClick={false}
              >
                <DataTable.Col source="rollNo" label="Roll No" />
                <DataTable.Col source="admissionNo" label="Admission No" />
                <DataTable.Col source="firstName" label="First Name" />
                <DataTable.Col source="lastName" label="Last Name" />
                <DataTable.Col 
                  label="Attendance & Reason" 
                  render={(record: any) => (
                    <AttendanceStatusRadio
                      student={record}
                      value={attendance[record.id]}
                      onChange={(status) => handleAttendanceChange(record.id, status)}
                      onReasonChange={(reason) => handleReasonChange(record.id, reason)}
                    />
                  )}
                />
              </DataTable>
              
              <div className="p-4 border-t flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={loading || students.length === 0}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedSection && students.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <Users className="h-12 w-12 opacity-50" />
                <p>No students found in this section</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!selectedSection && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Get Started</AlertTitle>
            <AlertDescription>
              Please select a class and section above to view students and mark attendance.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Create>
  );
};

export default AttendanceRegister;