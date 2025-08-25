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
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    if (sectionId) {
      loadTimetableData();
      loadTeachers();
      loadSubjects();
      loadRooms();
    }
  }, [sectionId]);

  const loadTimetableData = async () => {
    try {
      setLoading(true);
      
      // Load time slots
      const timeSlotsResponse = await fetch('/api/admin/timeSlots?pagination={"page":1,"perPage":1000}', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const timeSlotsData = await timeSlotsResponse.json();
      setTimeSlots(timeSlotsData.data || []);
      console.log('Loaded time slots:', (timeSlotsData.data || []).length, 'slots');

      // Load periods for this section
      const periodsResponse = await fetch(`/api/admin/timetable?filter={"sectionId":"${sectionId}"}&pagination={"page":1,"perPage":1000}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const periodsData = await periodsResponse.json();
      setPeriods(periodsData.data || []);
      console.log('Loaded periods:', (periodsData.data || []).length, 'periods for section', sectionId);
      
    } catch (error) {
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers?pagination={"page":1,"perPage":1000}', {
        headers: {
          'Content-Type': 'application/json',
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
      console.log('Loaded teachers:', formattedTeachers.length, 'teachers');
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects?pagination={"page":1,"perPage":1000}', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSubjects(data.data || []);
      console.log('Loaded subjects:', (data.data || []).length, 'subjects');
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms?pagination={"page":1,"perPage":1000}', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setRooms(data.data || []);
      console.log('Loaded rooms:', (data.data || []).length, 'rooms');
    } catch (error) {
      console.error('Error loading rooms:', error);
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
        // Find period for this day and time slot
        const period = periods.find(p => {
          // Handle different possible data structures
          const periodDay = p.timeSlot?.dayOfWeek || p.dayOfWeek;
          const periodSlotId = p.timeSlot?.id || p.timeSlotId;
          const periodSlotOrder = p.timeSlot?.slotOrder || p.slotOrder;
          
          return (periodDay === dayIndex + 1) && 
                 (periodSlotId === timeSlot.id || periodSlotOrder === timeSlot.slotOrder);
        });
        
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
        teacherId: cellData.period?.teacher?.id || cellData.period?.teacherId || '',
        subjectId: cellData.period?.subject?.id || cellData.period?.subjectId || '',
        roomId: cellData.period?.room?.id || cellData.period?.roomId || '',
        periodId: cellData.period?.id,
        timeSlotId: cellData.timeSlot.id,
        dayOfWeek: cellData.dayIndex + 1,
      });
    }
  };

  const handleSave = async () => {
    if (!editingData || !editingData.subjectId || !editingData.teacherId) {
      alert('Please select both subject and teacher');
      return;
    }

    try {
      let response;
      
      if (editingData.periodId) {
        // Update existing period
        response = await fetch(`/api/admin/timetable/${editingData.periodId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherId: editingData.teacherId,
            subjectId: editingData.subjectId,
            roomId: editingData.roomId || null,
          }),
        });
      } else {
        // Create new period
        response = await fetch('/api/admin/timetable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sectionId,
            subjectId: editingData.subjectId,
            teacherId: editingData.teacherId,
            roomId: editingData.roomId || null,
            timeSlotId: editingData.timeSlotId,
            dayOfWeek: editingData.dayOfWeek,
          }),
        });
      }

      if (response.ok) {
        console.log('Period saved successfully');
        // Reload data
        await loadTimetableData();
        
        // Reset editing state
        setEditingCell(null);
        setEditingData(null);
      } else {
        const errorData = await response.json();
        console.error('Error saving period:', errorData);
        alert('Failed to save period: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving period:', error);
      alert('Failed to save period. Please try again.');
    }
  };

  const renderPeriodCell = (cellData: any) => {
    const { period, cellKey, timeSlot } = cellData;
    const isEditing = editingCell === cellKey;

    if (isEditing && !readOnly) {
      return (
        <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 min-h-20">
          <div className="space-y-1">
            <Select 
              value={editingData?.subjectId || ''} 
              onValueChange={(value) => setEditingData(prev => ({ ...prev, subjectId: value }))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="max-h-32">
                {subjects.length > 0 ? subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <span title={subject.name} className="truncate">
                      {subject.name}
                    </span>
                  </SelectItem>
                )) : (
                  <SelectItem value="" disabled>
                    Loading subjects...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select 
              value={editingData?.teacherId || ''} 
              onValueChange={(value) => setEditingData(prev => ({ ...prev, teacherId: value }))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent className="max-h-32">
                {teachers.length > 0 ? teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <span title={teacher.name} className="truncate">
                      {teacher.name}
                    </span>
                  </SelectItem>
                )) : (
                  <SelectItem value="" disabled>
                    Loading teachers...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select 
              value={editingData?.roomId || ''} 
              onValueChange={(value) => setEditingData(prev => ({ ...prev, roomId: value }))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="Select Room (Optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-32">
                <SelectItem value="">
                  <span className="text-muted-foreground">No Room</span>
                </SelectItem>
                {rooms.length > 0 ? rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    <span title={room.name} className="truncate">
                      {room.name}
                    </span>
                  </SelectItem>
                )) : (
                  <SelectItem value="" disabled>
                    Loading rooms...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className="flex gap-1 pt-1">
              <Button 
                size="sm" 
                onClick={handleSave} 
                className="h-6 text-xs px-2 flex-1"
                disabled={!editingData?.subjectId || !editingData?.teacherId}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setEditingCell(null); setEditingData(null); }} 
                className="h-6 text-xs px-2"
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
        className={`p-2 min-h-20 border border-border bg-card ${!readOnly ? 'cursor-pointer hover:bg-muted/30' : ''} transition-colors flex flex-col justify-between`}
        onClick={() => handleCellClick(cellData)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
            <BookOpen className="h-3 w-3" />
            <span className="truncate">{period.subject?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">
              {period.teacher?.staff 
                ? `${period.teacher.staff.firstName} ${period.teacher.staff.lastName}` 
                : period.teacher?.name || 'Unknown Teacher'
              }
            </span>
          </div>
          {(period.room?.name || period.roomName) && (
            <div className="text-xs text-muted-foreground">
              📍 {period.room?.name || period.roomName}
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
      
      <CardContent className="p-6">
        <div className="overflow-x-auto bg-background rounded-lg border">
          <table className="w-full min-w-[1200px] border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-muted/50 sticky top-0">
                <th className="w-32 p-4 text-left text-sm font-semibold text-foreground border-r border-border bg-muted/50">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time Slot
                </th>
                {DAYS.map((day, index) => (
                  <th 
                    key={day} 
                    className="p-4 text-center text-sm font-semibold text-foreground border-r border-border min-w-52 bg-muted/50"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Body */}
            <tbody>
              {grid.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border hover:bg-muted/20 transition-colors">
                  {/* Time slot header */}
                  <td className="p-4 bg-muted/30 border-r border-border">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">
                        {row[0].timeSlot.startTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {row[0].timeSlot.endTime}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Period {row[0].timeSlot.slotOrder}
                      </div>
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