"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  User, 
  BookOpen, 
  AlertTriangle,
  Edit,
  Plus,
  Save,
  X
} from "lucide-react";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  slotOrder: number;
  dayOfWeek: number;
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
  timeSlot: TimeSlot;
}

interface TimetableCalendarProps {
  sectionId: string;
  sectionInfo?: {
    id: string;
    name: string;
    className: string;
  };
  onPeriodUpdate?: (periodId: string, updates: any) => void;
  onPeriodCreate?: (data: any) => void;
  readOnly?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  { id: '1', startTime: '08:00', endTime: '08:45', slotOrder: 1 },
  { id: '2', startTime: '08:45', endTime: '09:30', slotOrder: 2 },
  { id: '3', startTime: '09:30', endTime: '10:15', slotOrder: 3 },
  { id: '4', startTime: '10:30', endTime: '11:15', slotOrder: 4 }, // Break included
  { id: '5', startTime: '11:15', endTime: '12:00', slotOrder: 5 },
  { id: '6', startTime: '12:45', endTime: '13:30', slotOrder: 6 }, // Lunch break
  { id: '7', startTime: '13:30', endTime: '14:15', slotOrder: 7 },
  { id: '8', startTime: '14:15', endTime: '15:00', slotOrder: 8 },
];

const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  sectionId,
  sectionInfo,
  onPeriodUpdate,
  onPeriodCreate,
  readOnly = false
}) => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (sectionId) {
      loadTimetableData();
      loadTeachers();
      loadSubjects();
    }
  }, [sectionId]);

  const loadTimetableData = async () => {
    try {
      setLoading(true);
      
      // Load time slots
      const timeSlotsResponse = await fetch('/api/v1/timetable/time-slots', {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      const timeSlotsData = await timeSlotsResponse.json();
      setTimeSlots(timeSlotsData || []);

      // Load periods for this section
      const periodsResponse = await fetch(`/api/v1/timetable/periods?sectionId=${sectionId}&pageSize=1000`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      const periodsData = await periodsResponse.json();
      setPeriods(periodsData.data || []);
      
    } catch (error) {
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/v1/hr/teachers?pageSize=1000', {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      const data = await response.json();
      const formattedTeachers = (data.data || []).map((teacher: any) => ({
        ...teacher,
        name: teacher.staff 
          ? `${teacher.staff.firstName} ${teacher.staff.lastName}` 
          : teacher.name || 'Unknown Teacher'
      }));
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/v1/subjects?pageSize=1000', {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      const data = await response.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  // Create a grid structure for the calendar
  const createCalendarGrid = () => {
    const grid: any[][] = [];
    
    // Use API-loaded timeSlots, fallback to hardcoded ones if not loaded
    const slotsToUse = timeSlots.length > 0 ? timeSlots : TIME_SLOTS;
    
    // Group timeSlots by slotOrder for consistent ordering
    const sortedSlots = slotsToUse.sort((a, b) => a.slotOrder - b.slotOrder);
    
    sortedSlots.forEach((timeSlot, timeIndex) => {
      const row: any[] = [];
      
      DAYS.forEach((day, dayIndex) => {
        // Find period for this day and time slot using timeSlot ID
        const period = periods.find(p => 
          p.timeSlot.dayOfWeek === dayIndex + 1 && 
          p.timeSlot.id === timeSlot.id
        );
        
        row.push({
          dayIndex,
          timeIndex,
          timeSlot,
          period,
          cellKey: `${dayIndex}-${timeIndex}`
        });
      });
      
      grid.push(row);
    });
    
    return grid;
  };

  const handleCellClick = (cellData: any) => {
    if (readOnly) return;
    
    const cellKey = cellData.cellKey;
    
    if (editingCell === cellKey) {
      // Cancel editing
      setEditingCell(null);
      setEditingData(null);
    } else {
      // Start editing
      setEditingCell(cellKey);
      setEditingData({
        teacherId: cellData.period?.teacher?.id || '',
        subjectId: cellData.period?.subject?.id || '',
        periodId: cellData.period?.id,
        timeSlotId: cellData.timeSlot.id,
        dayOfWeek: cellData.dayIndex + 1,
      });
    }
  };

  const handleSave = async () => {
    if (!editingData) return;

    try {
      if (editingData.periodId) {
        // Update existing period
        await onPeriodUpdate?.(editingData.periodId, {
          teacherId: editingData.teacherId,
          subjectId: editingData.subjectId,
        });
      } else {
        // Create new period
        await onPeriodCreate?.({
          sectionId,
          subjectId: editingData.subjectId,
          teacherId: editingData.teacherId,
          timeSlotId: editingData.timeSlotId,
        });
      }

      // Reload data
      await loadTimetableData();
      
      // Reset editing state
      setEditingCell(null);
      setEditingData(null);
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const renderPeriodCell = (cellData: any) => {
    const { period, cellKey, timeSlot } = cellData;
    const isEditing = editingCell === cellKey;

    if (isEditing && !readOnly) {
      return (
        <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 h-20">
          <div className="space-y-1">
            <Select 
              value={editingData?.subjectId || ''} 
              onValueChange={(value) => setEditingData(prev => ({ ...prev, subjectId: value }))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={editingData?.teacherId || ''} 
              onValueChange={(value) => setEditingData(prev => ({ ...prev, teacherId: value }))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} className="h-5 text-xs px-1">
                <Save className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setEditingCell(null); setEditingData(null); }} 
                className="h-5 text-xs px-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (!period) {
      return (
        <div 
          className={`p-2 h-20 border border-border bg-muted/30 ${!readOnly ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
          onClick={() => handleCellClick(cellData)}
        >
          <div className="text-xs text-muted-foreground text-center h-full flex items-center justify-center">
            {!readOnly && <Plus className="h-3 w-3" />}
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`p-2 h-20 border border-border bg-card ${!readOnly ? 'cursor-pointer hover:bg-muted/30' : ''} transition-colors`}
        onClick={() => handleCellClick(cellData)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
            <BookOpen className="h-3 w-3" />
            <span className="truncate">{period.subject?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{period.teacher?.name || 'Unknown'}</span>
          </div>
          {period.room && (
            <div className="text-xs text-muted-foreground">
              📍 {period.room.name}
            </div>
          )}
          {!readOnly && (
            <div className="text-xs text-primary">
              <Edit className="h-3 w-3 inline" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const grid = createCalendarGrid();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Timetable</CardTitle>
            {sectionInfo && (
              <p className="text-sm text-muted-foreground mt-1">
                {sectionInfo.className} - {sectionInfo.name}
              </p>
            )}
          </div>
          {!readOnly && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
              Edit Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-[800px] border border-border rounded-lg">
            {/* Header */}
            <thead>
              <tr className="bg-muted/50">
                <th className="w-24 p-3 text-left text-sm font-medium text-foreground border-r border-border">
                  Time
                </th>
                {DAYS.map((day, index) => (
                  <th 
                    key={day} 
                    className="p-3 text-center text-sm font-medium text-foreground border-r border-border min-w-48"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Body */}
            <tbody>
              {grid.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border">
                  {/* Time slot header */}
                  <td className="p-3 bg-muted/50 border-r border-border">
                    <div className="text-xs font-medium text-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {row[0].timeSlot.startTime}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row[0].timeSlot.endTime}
                    </div>
                  </td>
                  
                  {/* Period cells */}
                  {row.map((cellData, cellIndex) => (
                    <td key={cellIndex} className="border-r border-border p-0">
                      {renderPeriodCell(cellData)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        {!readOnly && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <AlertTriangle className="h-4 w-4" />
              <strong>Instructions:</strong> Click on any cell to edit period assignments. Click empty cells to add new periods.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimetableCalendar;