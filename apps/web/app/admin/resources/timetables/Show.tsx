"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataProvider, useNotify } from 'ra-core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Users, MapPin, User, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimetablePeriod {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject?: {
    name: string;
    code: string;
    isElective?: boolean;
  };
  teacher?: {
    staff: {
      firstName: string;
      lastName: string;
    };
  };
  room?: {
    name: string;
  };
  isBreak?: boolean;
  breakType?: string;
}

interface TimetablePeriodResponse {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  breakType?: string;
  section: {
    id: string;
    name: string;
    capacity: number;
    class: {
      name: string;
      gradeLevel: number;
    };
    homeroomTeacher?: {
      staff: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    staff: {
      firstName: string;
      lastName: string;
    };
  };
  room?: {
    name: string;
  };
}

export const TimetablesShow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  
  const [timetablePeriod, setTimetablePeriod] = useState<TimetablePeriodResponse | null>(null);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { period: 1, start: "08:00", end: "08:45" },
    { period: 2, start: "08:45", end: "09:30" },
    { period: 3, start: "09:30", end: "10:15" },
    { period: 4, start: "10:30", end: "11:15" },
    { period: 5, start: "11:15", end: "12:00" },
    { period: 6, start: "01:00", end: "01:45" },
    { period: 7, start: "01:45", end: "02:30" },
    { period: 8, start: "02:30", end: "03:15" },
  ];
  
  useEffect(() => {
    if (id) {
      loadSectionAndTimetable();
    }
  }, [id]);
  
  const loadSectionAndTimetable = async () => {
    try {
      setLoading(true);
      
      // Load timetable period details
      const timetableResponse = await dataProvider.getOne('timetables', { id: id! });
      const periodData = timetableResponse.data as TimetablePeriodResponse;
      setTimetablePeriod(periodData);
      
      // Load all timetable periods for this section to show the full timetable
      const periodsResponse = await dataProvider.getList('timetablePeriods', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'dayOfWeek', order: 'ASC' },
        filter: { sectionId: periodData.section.id }
      });
      setPeriods(periodsResponse.data as TimetablePeriod[]);
    } catch (error) {
      notify('Error loading timetable', { type: 'error' });
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getPeriodForSlot = (dayOfWeek: number, periodNumber: number): TimetablePeriod | undefined => {
    return periods.find(p => p.dayOfWeek === dayOfWeek && p.periodNumber === periodNumber);
  };
  
  const renderPeriodCell = (dayOfWeek: number, periodNumber: number) => {
    const period = getPeriodForSlot(dayOfWeek, periodNumber);
    
    if (!period) {
      return (
        <div className="h-full p-2 text-center text-muted-foreground">
          <span className="text-xs">Empty</span>
        </div>
      );
    }
    
    if (period.isBreak) {
      return (
        <div className="h-full p-2 bg-yellow-50 dark:bg-yellow-900/20 text-center">
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            {period.breakType || 'Break'}
          </Badge>
        </div>
      );
    }
    
    return (
      <div className="h-full p-2 space-y-1">
        <div className="font-medium text-sm">
          {period.subject?.name || 'No Subject'}
        </div>
        {period.teacher && (
          <div className="text-xs text-muted-foreground">
            {period.teacher.staff.firstName} {period.teacher.staff.lastName}
          </div>
        )}
        {period.room && (
          <div className="text-xs text-muted-foreground">
            Room: {period.room.name}
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-6xl">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!timetablePeriod) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Timetable not found</p>
      </div>
    );
  }

  const section = timetablePeriod.section;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {section.class?.name || 'Unknown Class'} - Section {section.name} Timetable
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Grade {section.class?.gradeLevel || 'N/A'} • Capacity: {section.capacity || 0} students
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => navigate(`/timetables/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Timetable
              </Button>
            </div>
          </div>
        </CardHeader>
        {section.homeroomTeacher?.staff && (
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Homeroom Teacher: {section.homeroomTeacher.staff.firstName} {section.homeroomTeacher.staff.lastName}
              </span>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left w-24">Time</th>
                  {days.slice(1, 6).map(day => (
                    <th key={day} className="border p-2 bg-muted text-center min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.period}>
                    <td className="border p-2 bg-muted/50">
                      <div className="text-sm font-medium">
                        {slot.start} - {slot.end}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Period {slot.period}
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map(dayOfWeek => (
                      <td key={dayOfWeek} className="border p-0 h-20">
                        {renderPeriodCell(dayOfWeek, slot.period)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periods.length}</div>
            <p className="text-xs text-muted-foreground">Out of 40 weekly slots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(periods.filter(p => !p.isBreak).map(p => p.subject?.name)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(periods.filter(p => !p.isBreak).map(p => p.teacher?.staff?.firstName)).size}
            </div>
            <p className="text-xs text-muted-foreground">Assigned teachers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetablesShow;