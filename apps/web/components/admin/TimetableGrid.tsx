import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calendar, Clock, User, MapPin, BookOpen, GraduationCap, AlertCircle, Info } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotOrder: number;
  slotType: string;
}

interface TimetablePeriod {
  id: string;
  timeSlotId: string;
  timeSlot: TimeSlot;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    name: string;
    code: string;
  };
  isActive: boolean;
}

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

interface SubjectTeacherMapping {
  subjectId: string;
  subjectName: string;
  teachers: string[];
}

interface TimetableGridProps {
  sectionId: string;
  sectionName?: string;
  editable?: boolean;
  onPeriodClick?: (timeSlotId: string, dayOfWeek: number) => void;
}

const DAYS = [
  { value: 1, label: 'Monday', short: 'MON' },
  { value: 2, label: 'Tuesday', short: 'TUE' },
  { value: 3, label: 'Wednesday', short: 'WED' },
  { value: 4, label: 'Thursday', short: 'THU' },
  { value: 5, label: 'Friday', short: 'FRI' },
  { value: 6, label: 'Saturday', short: 'SAT' },
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  sectionId, 
  sectionName,
  editable = false,
  onPeriodClick 
}) => {
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [sectionDetails, setSectionDetails] = useState<Section | null>(null);
  const [subjectTeacherMappings, setSubjectTeacherMappings] = useState<SubjectTeacherMapping[]>([]);
  const [inappropriateAssignments, setInappropriateAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('current');

  useEffect(() => {
    fetchTimetableData();
  }, [sectionId]);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      
      // Fetch timetable periods for the section
      const periodsResponse = await fetch(`/api/v1/timetable/sections/${sectionId}`);
      const periodsData = await periodsResponse.json();
      
      // Fetch all time slots
      const slotsResponse = await fetch('/api/v1/timetable/time-slots');
      const slotsData = await slotsResponse.json();
      
      // Fetch section details
      const sectionResponse = await fetch(`/api/admin/sections/${sectionId}`);
      const sectionData = await sectionResponse.json();
      
      setPeriods(periodsData || []);
      setTimeSlots(slotsData || []);
      setSectionDetails(sectionData.data || null);
      
      // If we have section details, fetch additional data
      if (sectionData.data?.class?.id) {
        await Promise.all([
          fetchSubjectTeacherMappings(sectionData.data.class.id),
          checkInappropriateAssignments(sectionData.data.class.id, periodsData || [])
        ]);
      }
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
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
  
  const checkInappropriateAssignments = async (classId: string, periods: TimetablePeriod[]) => {
    try {
      const inappropriateList: string[] = [];
      
      for (const period of periods) {
        if (period.subject && period.teacher) {
          const response = await fetch('/api/admin/subjects/validate-assignment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              subjectId: period.subject.id, 
              teacherId: period.teacher.id, 
              classId 
            })
          });
          const data = await response.json();
          
          if (!data.valid) {
            inappropriateList.push(`${period.subject.name} - ${period.teacher.name}`);
          }
        }
      }
      
      setInappropriateAssignments(inappropriateList);
    } catch (error) {
      console.error('Error checking inappropriate assignments:', error);
    }
  };

  // Group time slots by slot order (periods) for x-axis
  const periodSlots = timeSlots
    .filter(slot => slot.slotType === 'regular')
    .reduce((acc, slot) => {
      if (!acc[slot.slotOrder]) {
        acc[slot.slotOrder] = slot;
      }
      return acc;
    }, {} as Record<number, TimeSlot>);

  const sortedPeriods = Object.values(periodSlots).sort((a, b) => a.slotOrder - b.slotOrder);

  // Create grid data structure
  const getGridData = () => {
    const grid: Record<number, Record<number, TimetablePeriod | null>> = {};
    
    // Initialize grid
    DAYS.forEach(day => {
      grid[day.value] = {};
      sortedPeriods.forEach(period => {
        grid[day.value][period.slotOrder] = null;
      });
    });

    // Fill grid with periods
    periods.forEach(period => {
      const slot = period.timeSlot;
      if (grid[slot.dayOfWeek] && slot.slotType === 'regular') {
        grid[slot.dayOfWeek][slot.slotOrder] = period;
      }
    });

    return grid;
  };

  const gridData = getGridData();

  const handleCellClick = (dayOfWeek: number, slotOrder: number) => {
    if (editable && onPeriodClick) {
      const timeSlot = sortedPeriods.find(p => p.slotOrder === slotOrder);
      if (timeSlot) {
        onPeriodClick(timeSlot.id, dayOfWeek);
      }
    }
  };

  const renderPeriodCell = (period: TimetablePeriod | null, dayOfWeek: number, slotOrder: number) => {
    const isEmpty = !period;
    const isClickable = editable;

    return (
      <div
        key={`${dayOfWeek}-${slotOrder}`}
        className={`
          min-h-[80px] p-2 border border-border transition-all duration-200
          ${isEmpty ? 'bg-muted hover:bg-muted/80' : 'bg-card hover:bg-accent'}
          ${isClickable ? 'cursor-pointer' : ''}
          ${!period?.isActive ? 'opacity-50' : ''}
        `}
        onClick={() => handleCellClick(dayOfWeek, slotOrder)}
      >
        {period ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {period.subject.code}
              </Badge>
              <div className="flex gap-1">
                {inappropriateAssignments.includes(`${period.subject.name} - ${period.teacher.name}`) && (
                  <Badge variant="destructive" className="text-xs">
                    Inappropriate
                  </Badge>
                )}
                {!period.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-0.5">
              <div className={`font-medium text-sm truncate ${
                inappropriateAssignments.includes(`${period.subject.name} - ${period.teacher.name}`) 
                  ? 'text-destructive' 
                  : 'text-foreground'
              }`}>
                {period.subject.name}
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="w-3 h-3 mr-1" />
                <span className={`truncate ${
                  inappropriateAssignments.includes(`${period.subject.name} - ${period.teacher.name}`) 
                    ? 'text-destructive' 
                    : ''
                }`}>{period.teacher.name}</span>
              </div>
              
              {period.room && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{period.room.code}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {editable ? (
              <div className="text-center">
                <div className="text-xs">Click to add</div>
                <div className="text-xs">period</div>
              </div>
            ) : (
              <div className="text-xs">Free</div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading timetable...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Information */}
      {sectionDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {sectionDetails.class.name} - {sectionDetails.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Grade Level: {sectionDetails.class.gradeLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Capacity: {sectionDetails.capacity}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Current Subject-Teacher Mappings */}
      {subjectTeacherMappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Current Subject-Teacher Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {subjectTeacherMappings.map((mapping, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="font-medium">{mapping.subjectName}</div>
                  <div className="flex flex-wrap gap-2">
                    {mapping.teachers.map((teacher, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{teacher}</Badge>
                    ))}
                    {mapping.teachers.length === 0 && (
                      <Badge variant="secondary" className="text-xs">No teachers assigned</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Inappropriate Assignments Warning */}
      {inappropriateAssignments.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Grade-Inappropriate Assignments Detected:</div>
              {inappropriateAssignments.map((assignment, index) => (
                <div key={index} className="text-sm">• {assignment}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Timetable {sectionName && `- ${sectionName}`}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
              
              {editable && (
                <Button size="sm" onClick={fetchTimetableData}>
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row with time periods */}
              <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] bg-muted border-b">
                <div className="p-3 font-semibold text-muted-foreground border-r">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Day / Period
                  </div>
                </div>
                
                {sortedPeriods.map((period, index) => (
                  <div key={period.id} className="p-3 text-center border-r border-gray-200">
                    <div className="font-semibold text-sm">Period {index + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {period.startTime} - {period.endTime}
                    </div>
                  </div>
                ))}
              </div>

              {/* Days rows */}
              {DAYS.map(day => (
                <div key={day.value} className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] border-b">
                  {/* Day label */}
                  <div className="p-3 bg-muted/50 border-r font-medium text-muted-foreground">
                    <div>{day.label}</div>
                    <div className="text-xs text-gray-500">{day.short}</div>
                  </div>
                  
                  {/* Period cells for this day */}
                  {sortedPeriods.map(period => 
                    renderPeriodCell(
                      gridData[day.value][period.slotOrder], 
                      day.value, 
                      period.slotOrder
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend & Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                <span>Scheduled Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/50 border border-gray-200 rounded"></div>
                <span>Free Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded opacity-50"></div>
                <span>Inactive Period</span>
              </div>
              {editable && (
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Click cells to edit periods</span>
                </div>
              )}
            </div>
            
            {sectionDetails && (
              <>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium mb-2">Grade {sectionDetails.class.gradeLevel} Information:</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>Total Periods: {periods.filter(p => p.isActive).length}</span>
                    <span>Free Periods: {(DAYS.length * sortedPeriods.length) - periods.filter(p => p.isActive).length}</span>
                    {inappropriateAssignments.length > 0 && (
                      <span className="text-destructive font-medium">
                        Inappropriate: {inappropriateAssignments.length}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};