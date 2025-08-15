"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  X
} from "lucide-react";
import { useNotify, useDataProvider } from 'ra-core';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  slotOrder: number;
}

interface Period {
  id: string;
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    name: string;
  };
}

interface GridDay {
  day: number;
  dayName: string;
  periods: Array<{
    timeSlot: TimeSlot;
    period: Period | null;
  }>;
}

interface TimetableGridData {
  section: {
    id: string;
    name: string;
    className: string;
  };
  grid: GridDay[];
  timeSlots: TimeSlot[];
}

interface Section {
  id: string;
  name: string;
  class: {
    name: string;
  };
}

interface Teacher {
  id: string;
  name: string;
  staff?: {
    firstName: string;
    lastName: string;
  };
}

interface Subject {
  id: string;
  name: string;
}

const TimetableGridList: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [gridData, setGridData] = useState<TimetableGridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingData, setEditingData] = useState<{
    teacherId: string;
    subjectId: string;
    periodId?: string;
  } | null>(null);
  const [currentConflicts, setCurrentConflicts] = useState<any[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // Load sections, teachers, and subjects on mount
  useEffect(() => {
    loadSections();
    loadTeachers();
    loadSubjects();
  }, []);

  // Load grid data when section is selected
  useEffect(() => {
    if (selectedSection) {
      loadGridData(selectedSection);
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      const response = await dataProvider.getList('sections', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
        filter: {},
      });
      setSections(response.data as Section[]);
      
      // Auto-select first section if available
      if (response.data.length > 0 && !selectedSection) {
        setSelectedSection(response.data[0].id);
      }
    } catch (error) {
      notify('Error loading sections', { type: 'error' });
      console.error('Error loading sections:', error);
    } finally {
      setSectionsLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await dataProvider.getList('teachers', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
        filter: {},
      });
      
      // Format teacher names from the API response
      const formattedTeachers = (response.data as any[]).map((teacher) => ({
        ...teacher,
        name: teacher.staff 
          ? `${teacher.staff.firstName} ${teacher.staff.lastName}` 
          : teacher.name || 'Unknown Teacher'
      }));
      
      setTeachers(formattedTeachers as Teacher[]);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await dataProvider.getList('subjects', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
        filter: {},
      });
      setSubjects(response.data as Subject[]);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadGridData = async (sectionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/timetable/grid/${sectionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load timetable data');
      }
      
      const data = await response.json();
      setGridData(data);
    } catch (error) {
      notify('Error loading timetable data', { type: 'error' });
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async (teacherId: string, timeSlotId: string, periodId?: string) => {
    try {
      const response = await fetch('/api/admin/timetable/check-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
        body: JSON.stringify({
          teacherId,
          timeSlotId,
          periodId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check conflicts');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  };

  const createPeriod = async (data: {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    timeSlotId: string;
  }) => {
    try {
      const response = await fetch('/api/admin/timetable/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create period');
      }
      
      const result = await response.json();
      notify('Period created successfully', { type: 'success' });
      
      // Reload grid data
      if (selectedSection) {
        loadGridData(selectedSection);
      }
      
      return result;
    } catch (error) {
      notify(`Error creating period: ${error.message}`, { type: 'error' });
      throw error;
    }
  };

  const updatePeriod = async (periodId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/timetable/periods/${periodId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update period');
      }
      
      const data = await response.json();
      notify('Period updated successfully', { type: 'success' });
      
      // Reload grid data
      if (selectedSection) {
        loadGridData(selectedSection);
      }
      
      return data;
    } catch (error) {
      notify(`Error updating period: ${error.message}`, { type: 'error' });
      throw error;
    }
  };

  const handleCellClick = (dayIndex: number, periodIndex: number, period: Period | null, timeSlot: TimeSlot) => {
    const cellKey = `${dayIndex}-${periodIndex}`;
    
    if (editingCell === cellKey) {
      // Cancel editing
      setEditingCell(null);
      setEditingData(null);
    } else {
      // Start editing
      setEditingCell(cellKey);
      setEditingData({
        teacherId: period?.teacher?.id || '',
        subjectId: period?.subject?.id || '',
        periodId: period?.id,
      });
    }
  };

  const handleSave = async (dayIndex: number, periodIndex: number, timeSlot: TimeSlot) => {
    if (!editingData || !selectedSection) return;

    try {
      // Check for conflicts first
      const conflictCheck = await checkConflicts(
        editingData.teacherId,
        timeSlot.id,
        editingData.periodId
      );

      if (conflictCheck.hasConflicts) {
        const conflictMessages = conflictCheck.conflicts.map((c: any) => c.message).join(', ');
        notify(`Cannot save: ${conflictMessages}`, { type: 'error' });
        return;
      }

      if (editingData.periodId) {
        // Update existing period
        await updatePeriod(editingData.periodId, {
          teacherId: editingData.teacherId,
          subjectId: editingData.subjectId,
        });
      } else {
        // Create new period
        await createPeriod({
          sectionId: selectedSection,
          subjectId: editingData.subjectId,
          teacherId: editingData.teacherId,
          timeSlotId: timeSlot.id,
        });
      }

      // Reset editing state
      setEditingCell(null);
      setEditingData(null);
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditingData(null);
    setCurrentConflicts([]);
  };

  // Real-time conflict checking when editing data changes
  useEffect(() => {
    const checkConflictsRealTime = async () => {
      if (!editingData?.teacherId || !editingCell) return;
      
      const [dayIndex, periodIndex] = editingCell.split('-').map(Number);
      if (!gridData?.timeSlots[periodIndex]) return;

      setCheckingConflicts(true);
      try {
        const conflictResult = await checkConflicts(
          editingData.teacherId,
          gridData.timeSlots[periodIndex].id,
          editingData.periodId
        );
        setCurrentConflicts(conflictResult.conflicts || []);
      } catch (error) {
        console.error('Error checking conflicts:', error);
        setCurrentConflicts([]);
      } finally {
        setCheckingConflicts(false);
      }
    };

    // Debounce the conflict checking
    const timeoutId = setTimeout(checkConflictsRealTime, 500);
    return () => clearTimeout(timeoutId);
  }, [editingData?.teacherId, editingData?.periodId, editingCell, gridData]);

  const getDayColor = (dayIndex: number) => {
    const colors = [
      'bg-red-50 border-red-200',      // Sunday
      'bg-blue-50 border-blue-200',    // Monday  
      'bg-green-50 border-green-200',  // Tuesday
      'bg-yellow-50 border-yellow-200', // Wednesday
      'bg-purple-50 border-purple-200', // Thursday
      'bg-pink-50 border-pink-200',    // Friday
      'bg-gray-50 border-gray-200',    // Saturday
    ];
    return colors[dayIndex] || colors[0];
  };

  const renderTimeSlotHeader = (timeSlot: TimeSlot) => (
    <div className="px-2 py-3 min-h-[160px] flex flex-col justify-center text-xs font-medium text-gray-600 bg-gray-50 border-r border-gray-200">
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{timeSlot.startTime}</span>
      </div>
      <div className="text-gray-400 mt-1">
        {timeSlot.endTime}
      </div>
    </div>
  );

  const renderPeriodCell = (period: Period | null, dayIndex: number, periodIndex: number, timeSlot: TimeSlot) => {
    const cellKey = `${dayIndex}-${periodIndex}`;
    const isEditing = editingCell === cellKey;
    const hasConflicts = conflicts[cellKey]?.length > 0;

    if (!period && !isEditing) {
      return (
        <div 
          className="p-3 min-h-[160px] border-r border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => handleCellClick(dayIndex, periodIndex, period, timeSlot)}
        >
          <div className="text-xs text-gray-400 text-center flex flex-col justify-center h-full">
            <span>Free Period</span>
            <div className="mt-1 text-xs text-gray-300">Click to add</div>
          </div>
        </div>
      );
    }

    if (isEditing) {
      const hasConflicts = currentConflicts.length > 0;
      
      return (
        <div className={`p-3 min-h-[160px] border-r border-gray-200 ${hasConflicts ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-blue-50 border-l-4 border-l-blue-500'}`}>
          <div className="space-y-2">
            <div className={`text-xs font-medium mb-2 ${hasConflicts ? 'text-red-800' : 'text-blue-800'}`}>
              Edit Period {checkingConflicts && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
            </div>
            
            {/* Subject Selector */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Subject:</label>
              <Select 
                value={editingData?.subjectId || ''} 
                onValueChange={(value) => setEditingData(prev => prev ? {...prev, subjectId: value} : null)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher Selector */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Teacher:</label>
              <Select 
                value={editingData?.teacherId || ''} 
                onValueChange={(value) => setEditingData(prev => prev ? {...prev, teacherId: value} : null)}
              >
                <SelectTrigger className={`h-8 text-xs ${hasConflicts ? 'border-red-300' : ''}`}>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conflict Warning */}
            {hasConflicts && (
              <div className="bg-red-100 border border-red-300 rounded p-2">
                <div className="flex items-center gap-1 text-xs text-red-700 font-medium mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  Scheduling Conflicts:
                </div>
                {currentConflicts.slice(0, 2).map((conflict, index) => (
                  <div key={index} className="text-xs text-red-600">
                    • {conflict.message || 'Teacher has another class at this time'}
                  </div>
                ))}
                {currentConflicts.length > 2 && (
                  <div className="text-xs text-red-500">
                    + {currentConflicts.length - 2} more conflict(s)
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1 pt-2">
              <Button
                size="sm"
                onClick={() => handleSave(dayIndex, periodIndex, timeSlot)}
                className="h-7 text-xs px-2"
                disabled={!editingData?.teacherId || !editingData?.subjectId || hasConflicts || checkingConflicts}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-7 text-xs px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`p-3 min-h-[160px] border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
          hasConflicts ? 'bg-red-50 border-red-200' : 'bg-white'
        }`}
        onClick={() => handleCellClick(dayIndex, periodIndex, period, timeSlot)}
      >
        <div className="space-y-1 h-full flex flex-col">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <BookOpen className="h-3 w-3" />
            <span className="truncate">{period.subject?.name || 'Unknown Subject'}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{period.teacher?.name || 'Unknown Teacher'}</span>
          </div>
          
          {period.room && (
            <div className="text-xs text-gray-500">
              📍 {period.room.name}
            </div>
          )}
          
          {hasConflicts && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Conflict</span>
            </div>
          )}
          
          <div className="flex-1"></div>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-blue-600">
              📝 Click to edit
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (sectionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading sections...
        </CardContent>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No sections found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Grid</h1>
          <p className="text-gray-600">Manage class schedules with inline editing</p>
        </div>
        
        {gridData && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {gridData.section?.className || 'Unknown Class'} - {gridData.section?.name || 'Unknown Section'}
            </Badge>
          </div>
        )}
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Class Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a class section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.class?.name || 'Unknown Class'} - {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {selectedSection && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading timetable...
              </div>
            )}
          </CardHeader>
          <CardContent>
            {gridData ? (
              <div className="overflow-x-auto">
                <div className="min-w-full border border-gray-200 rounded-lg">
                  {/* Header Row */}
                  <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(250px,1fr))] bg-gray-50">
                    <div className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Time Slots
                    </div>
                    {gridData.grid.map((day) => (
                      <div 
                        key={day.day} 
                        className={`px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 ${getDayColor(day.day)}`}
                      >
                        {day.dayName}
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows */}
                  {gridData.timeSlots.map((timeSlot, timeSlotIndex) => {
                    const dayPeriods = gridData.grid.map(day => 
                      day.periods.find(p => p.timeSlot.id === timeSlot.id)
                    );

                    return (
                      <div key={timeSlot.id} className="grid grid-cols-[120px_repeat(auto-fit,minmax(250px,1fr))] border-t border-gray-200">
                        {renderTimeSlotHeader(timeSlot)}
                        {dayPeriods.map((dayPeriod, dayIndex) => (
                          <div key={`${dayIndex}-${timeSlotIndex}`}>
                            {renderPeriodCell(
                              dayPeriod?.period || null, 
                              dayIndex, 
                              timeSlotIndex,
                              timeSlot
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span>Scheduled Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                    <span>Free Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                    <span>Conflict</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading timetable data...
                  </div>
                ) : (
                  'Select a section to view its timetable'
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong> Click on any period cell to edit teacher/subject assignments. Click on free periods to add new periods. The system automatically checks for teacher conflicts before saving changes.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TimetableGridList;