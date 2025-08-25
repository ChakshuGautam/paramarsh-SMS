"use client";

import React, { useState, useEffect } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  BooleanInput,
  useDataProvider,
  useNotify,
  useRedirect
} from 'react-admin';
import { required } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BookOpen, GraduationCap, Users, MapPin, Clock } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  capacity: number;
  class: {
    id: string;
    name: string;
    gradeLevel: number;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevel: number;
  isElective: boolean;
}

interface Teacher {
  id: string;
  staff: {
    firstName: string;
    lastName: string;
  };
  subjects: { id: string; name: string; }[];
}

interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  roomType: string;
}

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotOrder: number;
  slotType: string;
}

interface SubjectTeacherMapping {
  subjectId: string;
  subjectName: string;
  teachers: string[];
}

export const TimetableCreate = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [subjectTeacherMappings, setSubjectTeacherMappings] = useState<SubjectTeacherMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const daysOfWeek = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchGradeAppropriateSubjects(selectedSection.class.id);
      fetchSubjectTeacherMappings(selectedSection.class.id);
    }
  }, [selectedSection]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, teachersRes, roomsRes, timeSlotsRes] = await Promise.all([
        fetch('/api/admin/sections'),
        fetch('/api/admin/teachers'),
        fetch('/api/admin/rooms'),
        fetch('/api/admin/timeslots')
      ]);

      const [sectionsData, teachersData, roomsData, timeSlotsData] = await Promise.all([
        sectionsRes.json(),
        teachersRes.json(),
        roomsRes.json(),
        timeSlotsRes.json()
      ]);

      setSections(sectionsData.data || []);
      setTeachers(teachersData.data || []);
      setRooms(roomsData.data || []);
      setTimeSlots(timeSlotsData.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      notify('Error fetching form data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeAppropriateSubjects = async (classId: string) => {
    try {
      const response = await fetch(`/api/admin/subjects/appropriate-for-class/${classId}`);
      const data = await response.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error('Error fetching grade-appropriate subjects:', error);
      notify('Error fetching subjects for this grade', { type: 'error' });
    }
  };

  const fetchSubjectTeacherMappings = async (classId: string) => {
    try {
      const response = await fetch(`/api/admin/subjects/subject-teacher-class-mapping?classId=${classId}`);
      const data = await response.json();
      setSubjectTeacherMappings(data.data || []);
    } catch (error) {
      console.error('Error fetching subject-teacher mappings:', error);
    }
  };

  const validateAssignment = async (subjectId: string, teacherId: string, classId: string) => {
    try {
      const response = await fetch('/api/admin/subjects/validate-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, teacherId, classId })
      });
      const data = await response.json();
      
      if (!data.valid) {
        setValidationErrors(data.errors || []);
        return false;
      }
      
      setValidationErrors([]);
      return true;
    } catch (error) {
      console.error('Error validating assignment:', error);
      return true; // Allow if validation fails
    }
  };

  const handleSectionChange = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    setSelectedSection(section || null);
    setValidationErrors([]);
  };

  const handleSubjectOrTeacherChange = async (values: any) => {
    if (values.subjectId && values.teacherId && selectedSection) {
      await validateAssignment(values.subjectId, values.teacherId, selectedSection.class.id);
    }
  };

  const getFilteredTeachers = (subjectId?: string) => {
    if (!subjectId) return teachers;
    
    return teachers.filter(teacher => 
      teacher.subjects.some(subject => subject.id === subjectId)
    );
  };

  const getAvailableTimeSlots = () => {
    return timeSlots.filter(slot => slot.slotType === 'regular')
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.slotOrder - b.slotOrder;
      });
  };

  const formatTimeSlotLabel = (slot: TimeSlot) => {
    const dayName = daysOfWeek.find(d => d.id === slot.dayOfWeek)?.name || 'Unknown';
    return `${dayName} - Period ${slot.slotOrder} (${slot.startTime}-${slot.endTime})`;
  };

  if (loading) {
    return (
      <Create>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading form data...</p>
            </div>
          </CardContent>
        </Card>
      </Create>
    );
  }

  return (
    <Create>
      <SimpleForm 
        onSubmit={async (data) => {
          if (selectedSection && data.subjectId && data.teacherId) {
            const isValid = await validateAssignment(data.subjectId, data.teacherId, selectedSection.class.id);
            if (!isValid && validationErrors.length > 0) {
              notify('Please fix validation errors before submitting', { type: 'error' });
              return;
            }
          }
          
          try {
            await dataProvider.create('timetables', {
              data: {
                ...data,
                effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
                isActive: data.isActive !== false
              }
            });
            notify('Timetable entry created successfully', { type: 'success' });
            redirect('/admin/timetables');
          } catch (error) {
            notify('Error creating timetable entry', { type: 'error' });
          }
        }}
      >
        <div className="space-y-6">
          {/* Section Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class & Section Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelectInput
                source="sectionId"
                label="Class - Section"
                validate={required()}
                choices={sections.map(section => ({
                  id: section.id,
                  name: `${section.class.name} - ${section.name} (Grade ${section.class.gradeLevel})`
                }))}
                onChange={(value) => handleSectionChange(value)}
              />
              
              {selectedSection && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">Grade Level: {selectedSection.class.gradeLevel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {selectedSection.capacity}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Subject-Teacher Mappings */}
          {selectedSection && subjectTeacherMappings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Current Subject-Teacher Assignments for {selectedSection.class.name} - {selectedSection.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {subjectTeacherMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="font-medium">{mapping.subjectName}</div>
                      <div className="flex flex-wrap gap-2">
                        {mapping.teachers.map((teacher, idx) => (
                          <Badge key={idx} variant="outline">{teacher}</Badge>
                        ))}
                        {mapping.teachers.length === 0 && (
                          <Badge variant="secondary">No teachers assigned</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Assignment Validation Issues:</div>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm">• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Subject & Teacher Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject & Teacher Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSection && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Grade-Appropriate Subjects Available:</div>
                    <div>Showing subjects suitable for Grade {selectedSection.class.gradeLevel} students</div>
                  </div>
                </div>
              )}
              
              <SelectInput
                source="subjectId"
                label="Subject"
                validate={required()}
                choices={subjects.map(subject => ({
                  id: subject.id,
                  name: `${subject.name} (${subject.code}) ${subject.isElective ? '- Elective' : ''}`
                }))}
                onChange={(value) => handleSubjectOrTeacherChange({ subjectId: value })}
                disabled={!selectedSection}
              />
              
              <SelectInput
                source="teacherId"
                label="Teacher"
                validate={required()}
                choices={getFilteredTeachers().map(teacher => ({
                  id: teacher.id,
                  name: `${teacher.staff.firstName} ${teacher.staff.lastName}`
                }))}
                onChange={(value) => handleSubjectOrTeacherChange({ teacherId: value })}
                disabled={!selectedSection}
              />
            </CardContent>
          </Card>

          {/* Time & Room Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelectInput
                source="timeSlotId"
                label="Time Slot"
                validate={required()}
                choices={getAvailableTimeSlots().map(slot => ({
                  id: slot.id,
                  name: formatTimeSlotLabel(slot)
                }))}
              />
              
              <SelectInput
                source="roomId"
                label="Room (Optional)"
                choices={rooms.map(room => ({
                  id: room.id,
                  name: `${room.name} (${room.code}) - ${room.roomType} - Capacity: ${room.capacity}`
                }))}
              />
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DateInput
                source="effectiveFrom"
                label="Effective From Date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              
              <BooleanInput
                source="isActive"
                label="Active"
                defaultValue={true}
              />
            </CardContent>
          </Card>
        </div>
      </SimpleForm>
    </Create>
  );
};