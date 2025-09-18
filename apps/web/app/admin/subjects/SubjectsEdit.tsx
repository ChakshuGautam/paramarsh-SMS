"use client";

import React, { useEffect, useState } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  BooleanInput,
  required
} from '@/components/admin';
import { useRecordContext, useDataProvider, useNotify } from 'react-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, School } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassTeacherAssignment {
  id?: string;
  classId: string;
  teacherId: string;
  className?: string;
  teacherName?: string;
  gradeLevel?: number;
}

const SubjectClassTeacherField = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: ClassSubjectTeacher API endpoint not yet implemented
  // This is a placeholder for future backend implementation
  useEffect(() => {
    // Mock data for demonstration - will be replaced when backend endpoint is ready
    setAssignments([]);
    setLoading(false);
  }, [record?.id]);

  // Load classes and teachers
  useEffect(() => {
    // Load classes
    dataProvider
      .getList('classes', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'gradeLevel', order: 'ASC' }
      })
      .then(({ data }) => {
        setClasses(data);
      })
      .catch(() => {
        notify('Failed to load classes', { type: 'error' });
      });

    // Load teachers
    dataProvider
      .getList('teachers', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' }
      })
      .then(({ data }) => {
        setTeachers(data);
      })
      .catch(() => {
        notify('Failed to load teachers', { type: 'error' });
      });
  }, [dataProvider, notify]);

  const handleAddAssignment = async () => {
    if (!selectedClass || !selectedTeacher) {
      notify('Please select both a class and a teacher', { type: 'warning' });
      return;
    }

    // Check if assignment already exists
    const exists = assignments.some(
      a => a.classId === selectedClass && a.teacherId === selectedTeacher
    );
    if (exists) {
      notify('This assignment already exists', { type: 'warning' });
      return;
    }

    // Note: Backend endpoint not yet implemented
    // For now, just update local state
    const selectedClassData = classes.find(c => c.id === selectedClass);
    const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);

    const newAssignment: ClassTeacherAssignment = {
      id: `temp-${Date.now()}`,
      classId: selectedClass,
      teacherId: selectedTeacher,
      className: selectedClassData?.name || 'Unknown Class',
      teacherName: selectedTeacherData?.staff?.fullName || selectedTeacherData?.name || 'Unknown Teacher',
      gradeLevel: selectedClassData?.gradeLevel
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedClass('');
    setSelectedTeacher('');
    notify('Assignment added locally (changes will not be saved - backend API pending)', { type: 'warning' });
  };

  const handleRemoveAssignment = async (assignmentToRemove: ClassTeacherAssignment) => {
    if (!assignmentToRemove.id) return;

    // Note: Backend endpoint not yet implemented
    // For now, just update local state
    setAssignments(assignments.filter(a => a.id !== assignmentToRemove.id));
    notify('Assignment removed locally (changes will not be saved - backend API pending)', { type: 'warning' });
  };

  // Group assignments by grade level
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const level = assignment.gradeLevel || 0;
    let group = 'Other';
    if (level >= 1 && level <= 5) group = 'Primary (1-5)';
    else if (level >= 6 && level <= 8) group = 'Middle (6-8)';
    else if (level >= 9 && level <= 12) group = 'High (9-12)';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(assignment);
    return acc;
  }, {} as Record<string, ClassTeacherAssignment[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5" />
            Class & Teacher Assignments
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            Preview Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new assignment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Class...</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Grade {cls.gradeLevel})
              </option>
            ))}
          </select>

          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Teacher...</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.staff?.fullName || teacher.name} ({teacher.staff?.email || teacher.email})
              </option>
            ))}
          </select>

          <Button 
            onClick={handleAddAssignment}
            disabled={!selectedClass || !selectedTeacher}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </div>

        {/* Display existing assignments */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            <School className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No class assignments yet</p>
            <p className="text-sm mt-1">Add classes and teachers to start teaching this subject</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAssignments).map(([group, groupAssignments]) => (
              <div key={group}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">{group}</h4>
                <div className="space-y-2">
                  {groupAssignments.map((assignment) => (
                    <div
                      key={assignment.id || `${assignment.classId}-${assignment.teacherId}`}
                      className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <School className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{assignment.className}</span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-muted-foreground flex-inline items-center gap-1">
                            <Users className="w-3 h-3 inline" />
                            {assignment.teacherName}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
          <strong>⚠️ Preview Mode:</strong> The class-teacher assignment feature requires backend API implementation. 
          Changes made here are stored locally in your browser session only and will be lost when you refresh the page.
        </div>
      </CardContent>
    </Card>
  );
};

export const SubjectsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <div className="w-full flex flex-col gap-6">
          {/* Basic Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput 
                source="code" 
                label="Subject Code"
                placeholder="e.g. MATH101, ENG201"
                validate={required()} 
              />
              <TextInput 
                source="name" 
                label="Subject Name"
                placeholder="e.g. Advanced Mathematics"
                validate={required()} 
              />
              <div className="md:col-span-2">
                <TextInput 
                  source="description" 
                  label="Description"
                  placeholder="Brief description of the subject"
                  multiline
                  rows={3}
                />
              </div>
              <NumberInput 
                source="credits" 
                label="Credits"
                placeholder="e.g. 3"
                min={1}
                max={10}
              />
              <BooleanInput 
                source="isElective" 
                label="Is Elective Subject"
              />
              <div className="md:col-span-2">
                <TextInput 
                  source="prerequisites" 
                  label="Prerequisites"
                  placeholder="e.g. Basic Mathematics, Science Foundation"
                  multiline
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Class and Teacher Assignments */}
          <SubjectClassTeacherField />
        </div>
      </SimpleForm>
    </Edit>
  );
};