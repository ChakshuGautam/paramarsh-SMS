"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  Download,
  Share
} from "lucide-react";
import { useParams } from 'react-router-dom';
import { useNotify, useDataProvider, useRedirect } from 'ra-core';
import TimetableCalendar from './components/TimetableCalendar';

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

const TimetableShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const redirect = useRedirect();
  const notify = useNotify();
  const dataProvider = useDataProvider();

  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadSection();
      loadStats();
    }
  }, [id]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const response = await dataProvider.getOne('sections', { id: id! });
      setSection(response.data as Section);
    } catch (error) {
      notify('Error loading section', { type: 'error' });
      console.error('Error loading section:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get timetable statistics
      const periodsResponse = await dataProvider.getList('timetablePeriods', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
        filter: { sectionId: id, isActive: true },
      });

      const timeSlotsResponse = await fetch('${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005/api/v1'}/timetable/time-slots', {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': 'branch1',
        },
      });
      const timeSlots = await timeSlotsResponse.json();

      const totalSlots = timeSlots?.length || 0;
      const filledSlots = periodsResponse.total || 0;
      const completionPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

      // Get subject distribution
      const subjects = new Set((periodsResponse.data as any[]).map(p => p.subject?.name).filter(Boolean));
      const teachers = new Set((periodsResponse.data as any[]).map(p => p.teacher?.name).filter(Boolean));

      setStats({
        totalSlots,
        filledSlots,
        completionPercentage,
        subjectCount: subjects.size,
        teacherCount: teachers.size,
        subjects: Array.from(subjects),
        teachers: Array.from(teachers),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEdit = () => {
    redirect('edit', 'timetables', id);
  };

  const handleBack = () => {
    redirect('list', 'timetables');
  };

  const handleDownload = () => {
    // TODO: Implement timetable PDF export
    notify('PDF export feature coming soon', { type: 'info' });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Section not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timetables
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Timetable: {section.class?.name || 'Unknown Class'} - {section.name}
            </h1>
            <p className="text-gray-600">
              Weekly schedule overview for this class section
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Timetable
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Completion</div>
                <div className="text-xl font-bold">{stats?.completionPercentage || 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Periods</div>
                <div className="text-xl font-bold">
                  {stats?.filledSlots || 0}/{stats?.totalSlots || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Subjects</div>
                <div className="text-xl font-bold">{stats?.subjectCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Teachers</div>
                <div className="text-xl font-bold">{stats?.teacherCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Section Information
            </CardTitle>
            <Badge className={getCompletionColor(stats?.completionPercentage || 0)}>
              {stats?.completionPercentage || 0}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Class</div>
              <div className="font-medium">{section.class?.name || 'Unknown Class'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Section</div>
              <div className="font-medium">{section.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Grade Level</div>
              <div className="font-medium">Grade {section.class?.gradeLevel || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Capacity</div>
              <div className="font-medium">{section.capacity} students</div>
            </div>
          </div>

          {/* Subject and Teacher Lists */}
          {stats && (stats.subjects.length > 0 || stats.teachers.length > 0) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.subjects.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Subjects Taught</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.subjects.map((subject: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {stats.teachers.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Teachers Assigned</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.teachers.map((teacher: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {teacher}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable Calendar (Read Only) */}
      <TimetableCalendar
        sectionId={section.id}
        sectionInfo={{
          id: section.id,
          name: section.name,
          className: section.class?.name || 'Unknown Class',
        }}
        readOnly={true}
      />

      {/* Help Text */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          This is a read-only view of the timetable. Click "Edit Timetable" above to make changes 
          to the schedule, add new periods, or modify teacher assignments.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TimetableShow;