"use client";

import React from 'react';
import { EditBase, useEditContext, useResourceContext } from 'ra-core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, GraduationCap } from "lucide-react";
import TimetableCalendar from './components/TimetableCalendar';

// Component to display the timetable calendar with section info
const TimetableCalendarField = () => {
  const context = useEditContext();
  const record = context.record;
  
  if (!record) return null;
  
  const sectionInfo = {
    id: record.id,
    name: record.name,
    className: record.class?.name || record.className || 'Unknown Class',
    capacity: record.capacity || 'N/A'
  };
  
  return (
    <div className="space-y-4">
      {/* Section Information Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5" />
            Section Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Class</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {sectionInfo.className}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Section</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{sectionInfo.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Capacity</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{sectionInfo.capacity} students</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timetable Calendar - Full Width */}
      <TimetableCalendar
        sectionId={record.id}
        sectionInfo={sectionInfo}
        readOnly={false}
      />
    </div>
  );
};

// Custom Edit View for full screen layout
const TimetableEditView = () => {
  const context = useEditContext();
  const resource = useResourceContext();

  if (context.isLoading || !context.record) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Full-width header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Edit Timetable
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage the weekly schedule for {context.record.class?.name || context.record.className} - {context.record.name}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Edit Mode
          </Badge>
        </div>
      </div>

      {/* Full-width content */}
      <div className="px-6 py-6">
        <TimetableCalendarField />
      </div>
    </div>
  );
};

export const TimetableEdit = () => (
  <EditBase>
    <TimetableEditView />
  </EditBase>
);

export default TimetableEdit;