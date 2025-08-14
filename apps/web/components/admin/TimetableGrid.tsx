import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, Clock, User, MapPin, BookOpen } from 'lucide-react';

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
      
      setPeriods(periodsData || []);
      setTimeSlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
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
          min-h-[80px] p-2 border border-gray-200 transition-all duration-200
          ${isEmpty ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-blue-50'}
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
              {!period.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            
            <div className="space-y-0.5">
              <div className="font-medium text-sm text-gray-900 truncate">
                {period.subject.name}
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate">{period.teacher.name}</span>
              </div>
              
              {period.room && (
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{period.room.code}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
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
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timetable {sectionName && `- ${sectionName}`}
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
              <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] bg-gray-100 border-b">
                <div className="p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Day / Period
                  </div>
                </div>
                
                {sortedPeriods.map((period, index) => (
                  <div key={period.id} className="p-3 text-center border-r border-gray-200">
                    <div className="font-semibold text-sm">Period {index + 1}</div>
                    <div className="text-xs text-gray-600">
                      {period.startTime} - {period.endTime}
                    </div>
                  </div>
                ))}
              </div>

              {/* Days rows */}
              {DAYS.map(day => (
                <div key={day.value} className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] border-b">
                  {/* Day label */}
                  <div className="p-3 bg-gray-50 border-r font-medium text-gray-700">
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

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>Scheduled Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
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
        </CardContent>
      </Card>
    </div>
  );
};