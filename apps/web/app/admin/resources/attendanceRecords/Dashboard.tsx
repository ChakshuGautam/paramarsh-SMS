"use client";

import { useState, useEffect } from "react";
import { useDataProvider } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  School
} from "lucide-react";
import { format } from "date-fns";

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

interface ClassAttendance {
  classId: string;
  className: string;
  gradeLevel: number;
  sections: SectionAttendance[];
  stats: AttendanceStats;
}

interface SectionAttendance {
  sectionId: string;
  sectionName: string;
  stats: AttendanceStats;
  trend: 'up' | 'down' | 'stable';
}

export const AttendanceDashboard = () => {
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [overallStats, setOverallStats] = useState<AttendanceStats | null>(null);
  const [classData, setClassData] = useState<ClassAttendance[]>([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<'primary' | 'middle' | 'high' | 'all'>('all');

  useEffect(() => {
    fetchAttendanceData();
  }, [date]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch attendance records for the selected date
      const { data: attendanceRecords } = await dataProvider.getList('attendanceRecords', {
        filter: { date: format(date, 'yyyy-MM-dd') },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'date', order: 'DESC' }
      });

      // Fetch classes and sections
      const { data: classes } = await dataProvider.getList('classes', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'gradeLevel', order: 'ASC' }
      });

      const { data: sections } = await dataProvider.getList('sections', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' }
      });

      // Process the data
      const processedData = processAttendanceData(attendanceRecords, classes, sections);
      setOverallStats(calculateOverallStats(attendanceRecords));
      setClassData(processedData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (records: any[]): AttendanceStats => {
    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      total: records.length,
      percentage: 0
    };
    
    stats.percentage = stats.total > 0 
      ? Math.round((stats.present / stats.total) * 100) 
      : 0;
    
    return stats;
  };

  const processAttendanceData = (records: any[], classes: any[], sections: any[]): ClassAttendance[] => {
    const classMap = new Map<string, ClassAttendance>();

    classes.forEach(cls => {
      const classSections = sections.filter(s => s.classId === cls.id);
      const sectionAttendance: SectionAttendance[] = classSections.map(section => {
        const sectionRecords = records.filter(r => r.sectionId === section.id);
        const stats = calculateOverallStats(sectionRecords);
        
        return {
          sectionId: section.id,
          sectionName: section.name,
          stats,
          trend: determineTrend(stats.percentage)
        };
      });

      const classRecords = records.filter(r => 
        classSections.some(s => s.id === r.sectionId)
      );

      classMap.set(cls.id, {
        classId: cls.id,
        className: cls.name,
        gradeLevel: cls.gradeLevel,
        sections: sectionAttendance,
        stats: calculateOverallStats(classRecords)
      });
    });

    return Array.from(classMap.values());
  };

  const determineTrend = (percentage: number): 'up' | 'down' | 'stable' => {
    // In a real app, you'd compare with historical data
    if (percentage >= 95) return 'up';
    if (percentage < 85) return 'down';
    return 'stable';
  };

  const getGradeLevelData = () => {
    if (selectedGradeLevel === 'all') return classData;
    
    const ranges = {
      primary: [1, 5],
      middle: [6, 8],
      high: [9, 12]
    };
    
    const [min, max] = ranges[selectedGradeLevel];
    return classData.filter(c => c.gradeLevel >= min && c.gradeLevel <= max);
  };

  if (loading) {
    return <div>Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Date Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats?.present || 0}
            </div>
            <Progress 
              value={overallStats?.percentage || 0} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats?.percentage || 0}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallStats?.absent || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallStats?.total ? 
                Math.round((overallStats.absent / overallStats.total) * 100) : 0}% absence rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overallStats?.late || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallStats?.excused || 0} excused absences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class & Section Wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Class & Section Wise Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedGradeLevel} onValueChange={(v) => setSelectedGradeLevel(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Classes</TabsTrigger>
              <TabsTrigger value="primary">Primary (1-5)</TabsTrigger>
              <TabsTrigger value="middle">Middle (6-8)</TabsTrigger>
              <TabsTrigger value="high">High (9-12)</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedGradeLevel} className="space-y-4 mt-4">
              {getGradeLevelData().map((classItem) => (
                <div key={classItem.classId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{classItem.className}</h3>
                    <Badge variant={classItem.stats.percentage >= 90 ? "default" : "destructive"}>
                      {classItem.stats.percentage}% Present
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classItem.sections.map((section) => (
                      <div key={section.sectionId} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Section {section.sectionName}</span>
                          {section.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {section.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Present:</span>
                            <span className="font-medium text-green-600">{section.stats.present}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Absent:</span>
                            <span className="font-medium text-red-600">{section.stats.absent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Late:</span>
                            <span className="font-medium text-orange-600">{section.stats.late}</span>
                          </div>
                        </div>
                        
                        <Progress 
                          value={section.stats.percentage} 
                          className="h-2 mt-2"
                        />
                        <p className="text-xs text-center mt-1 text-muted-foreground">
                          {section.stats.percentage}% attendance
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;