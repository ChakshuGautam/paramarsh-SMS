import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotOrder: number;
}

interface TimetablePeriod {
  id: string;
  timeSlot: TimeSlot;
  subject: {
    name: string;
    code: string;
  };
  teacher: {
    name: string;
  };
  room?: {
    code: string;
  };
}

interface TimetableWeekViewProps {
  periods: TimetablePeriod[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  compact?: boolean;
}

const DAYS = [
  { value: 1, label: 'Monday', short: 'MON' },
  { value: 2, label: 'Tuesday', short: 'TUE' },
  { value: 3, label: 'Wednesday', short: 'WED' },
  { value: 4, label: 'Thursday', short: 'THU' },
  { value: 5, label: 'Friday', short: 'FRI' },
  { value: 6, label: 'Saturday', short: 'SAT' },
];

export const TimetableWeekView: React.FC<TimetableWeekViewProps> = ({
  periods,
  currentDate = new Date(),
  onDateChange,
  compact = false
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push(currentDay);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Convert "09:00:00" to "09:00"
  };

  const getPeriodsForDay = (dayOfWeek: number) => {
    return periods
      .filter(p => p.timeSlot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.timeSlot.slotOrder - b.timeSlot.slotOrder);
  };

  const getUniqueTimeSlots = () => {
    const slots = periods.map(p => p.timeSlot);
    const unique = slots.filter((slot, index, self) => 
      index === self.findIndex(s => s.slotOrder === slot.slotOrder)
    );
    return unique.sort((a, b) => a.slotOrder - b.slotOrder);
  };

  const timeSlots = getUniqueTimeSlots();

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Week Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.slice(0, 6).map((day, index) => {
              const dayPeriods = getPeriodsForDay(day.value);
              const date = weekDates[index];
              
              return (
                <div key={day.value} className="space-y-1">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600">{day.short}</div>
                    <div className="text-sm font-semibold">{date.getDate()}</div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayPeriods.slice(0, 3).map(period => (
                      <div key={period.id} className="p-1 bg-blue-50 rounded text-xs">
                        <div className="font-medium truncate">{period.subject.code}</div>
                        <div className="text-gray-600 truncate">
                          {formatTime(period.timeSlot.startTime)}
                        </div>
                      </div>
                    ))}
                    {dayPeriods.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayPeriods.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle>
              Week of {weekDates[0].toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next Week
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-6 gap-4">
          {DAYS.slice(0, 6).map((day, index) => {
            const dayPeriods = getPeriodsForDay(day.value);
            const date = weekDates[index];
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day.value} className={`space-y-3 ${isToday ? 'ring-2 ring-blue-200 rounded-lg p-2' : ''}`}>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{day.label}</div>
                  <div className={`text-sm ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayPeriods.map(period => (
                    <div key={period.id} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {period.subject.code}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(period.timeSlot.startTime)}
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {period.subject.name}
                      </div>
                      
                      <div className="text-xs text-gray-600 truncate">
                        {period.teacher.name}
                      </div>
                      
                      {period.room && (
                        <div className="text-xs text-gray-500">
                          Room: {period.room.code}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayPeriods.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};