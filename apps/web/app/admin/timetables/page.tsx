import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TimetableGrid } from '@/components/admin/TimetableGrid';
import { Calendar, Plus, Download, Settings, ExternalLink } from 'lucide-react';
import { useCreatePath } from 'ra-core';
import { Link } from 'react-router-dom';

interface Section {
  id: string;
  name: string;
  class: {
    id: string;
    name: string;
    gradeLevel: number;
  };
}

export default function TimetablesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const createPath = useCreatePath();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/v1/sections');
      const data = await response.json();
      setSections(data || []);
      
      // Auto-select first section if available
      if (data && data.length > 0) {
        setSelectedSection(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Timetables
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage class timetables and schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Auto Generate
          </Button>
        </div>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="min-w-[300px]">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section to view timetable" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.class.name} - {section.name} (Grade {section.class.gradeLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSectionData && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing timetable for <strong>{selectedSectionData.class.name} - {selectedSectionData.name}</strong>
                </div>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                >
                  <Link to={createPath({
                    resource: "sectionTimetables",
                    type: "show",
                    id: selectedSection
                  })}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in React Admin
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {selectedSection && (
        <TimetableGrid 
          sectionId={selectedSection}
          sectionName={selectedSectionData ? `${selectedSectionData.class.name} - ${selectedSectionData.name}` : undefined}
          editable={true}
          onPeriodClick={(timeSlotId, dayOfWeek) => {
            console.log('Period clicked:', { timeSlotId, dayOfWeek, sectionId: selectedSection });
            // Here you can open a modal or navigate to edit the period
          }}
        />
      )}

      {/* Empty State */}
      {!loading && sections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sections Found</h3>
            <p className="text-gray-600 mb-4">
              Create some sections first to view their timetables.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}