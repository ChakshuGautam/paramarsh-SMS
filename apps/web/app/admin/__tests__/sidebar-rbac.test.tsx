import React from 'react';
import { render, screen } from '@testing-library/react';
import * as ReactDOMClient from 'react-dom/client';
// Shim createRoot for React 19 + RTL if missing
if (!(ReactDOMClient as any).createRoot) {
  (ReactDOMClient as any).createRoot = (container: Element | DocumentFragment) => {
    const ReactDOM = require('react-dom');
    return {
      render: (ui: any) => (ReactDOM as any).render(ui, container),
      unmount: () => (ReactDOM as any).unmountComponentAtNode(container as Element),
    };
  };
}
import { CoreAdminContext, ResourceDefinitionContextProvider } from 'ra-core';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

function renderWithResources(roles: string[] | undefined, resources: Record<string, any>) {
  const identity = roles ? { id: 'u1', fullName: 'Test', roles } : undefined;
  return render(
    <CoreAdminContext
      dataProvider={{} as any}
      authProvider={{
        checkAuth: async () => undefined,
        getPermissions: async () => roles ?? [],
        getIdentity: async () => identity as any,
      } as any}
      i18nProvider={{
        translate: (key: string, options?: any) => options?._ ?? key,
        changeLocale: async () => undefined,
        getLocale: () => 'en',
      }}
    >
      <ResourceDefinitionContextProvider
        definitions={{
          // Core Academic Structure
          students: { name: 'students', hasList: true },
          guardians: { name: 'guardians', hasList: true },
          classes: { name: 'classes', hasList: true },
          sections: { name: 'sections', hasList: true },
          enrollments: { name: 'enrollments', hasList: true },
          
          // Daily Academic Operations
          attendanceSessions: { name: 'attendanceSessions', hasList: true },
          substitutions: { name: 'substitutions', hasList: true },
          teacherAttendance: { name: 'teacherAttendance', hasList: true },
          
          // Academic Planning
          subjects: { name: 'subjects', hasList: true },
          teachers: { name: 'teachers', hasList: true },
          academicYears: { name: 'academicYears', hasList: true },
          
          // Academic Assessment
          exams: { name: 'exams', hasList: true },
          marks: { name: 'marks', hasList: true },
          
          // Academic Records & History
          attendanceRecords: { name: 'attendanceRecords', hasList: true },
          applications: { name: 'applications', hasList: true },
          
          // Timetable Management
          timetables: { name: 'timetables', hasList: true },
          timetablePeriods: { name: 'timetablePeriods', hasList: true },
          sectionTimetables: { name: 'sectionTimetables', hasList: true },
          timeSlots: { name: 'timeSlots', hasList: true },
          rooms: { name: 'rooms', hasList: true },
          
          // Finance
          feeStructures: { name: 'feeStructures', hasList: true },
          feeSchedules: { name: 'feeSchedules', hasList: true },
          invoices: { name: 'invoices', hasList: true },
          payments: { name: 'payments', hasList: true },
          
          // Communication
          messages: { name: 'messages', hasList: true },
          campaigns: { name: 'campaigns', hasList: true },
          templates: { name: 'templates', hasList: true },
          tickets: { name: 'tickets', hasList: true },
          
          // Administration
          staff: { name: 'staff', hasList: true },
          tenants: { name: 'tenants', hasList: true },
          preferences: { name: 'preferences', hasList: true },
        }}
      >
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </ResourceDefinitionContextProvider>
    </CoreAdminContext>
  );
}

describe('AppSidebar RBAC filtering', () => {
  test('admin sees resources from default open groups', async () => {
    renderWithResources(['admin'], {});
    
    // Admin should see resources from Core Academic Structure (open by default)
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    expect(screen.getByTestId('menu-guardians')).toBeInTheDocument();
    expect(screen.getByTestId('menu-classes')).toBeInTheDocument();
    expect(screen.getByTestId('menu-sections')).toBeInTheDocument();
    expect(screen.getByTestId('menu-enrollments')).toBeInTheDocument();
    
    // Admin should see resources from Daily Academic Operations (open by default)  
    expect(screen.getByTestId('menu-attendanceSessions')).toBeInTheDocument();
    expect(screen.getByTestId('menu-substitutions')).toBeInTheDocument();
    expect(screen.getByTestId('menu-teacherAttendance')).toBeInTheDocument();
  });

  test('teacher sees only allowed resources from default open groups', async () => {
    renderWithResources(['teacher'], {});
    
    // Resources that teachers should see from Core Academic Structure (open by default)
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    expect(screen.getByTestId('menu-guardians')).toBeInTheDocument(); // Teachers CAN see guardians
    expect(screen.getByTestId('menu-classes')).toBeInTheDocument();
    expect(screen.getByTestId('menu-sections')).toBeInTheDocument();
    expect(screen.getByTestId('menu-enrollments')).toBeInTheDocument();
    
    // Resources that teachers should see from Daily Academic Operations (open by default)
    // Based on permissions.ts, teachers have access to substitutions
    expect(screen.getByTestId('menu-substitutions')).toBeInTheDocument();
  });

  test('admin vs teacher permission differences are enforced', async () => {
    // Test admin first - admin can see attendanceRecords from Daily Academic Operations group
    const { unmount: unmountAdmin } = renderWithResources(['admin'], {});
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    expect(screen.getByTestId('menu-attendanceSessions')).toBeInTheDocument(); // All admin resources should be visible
    unmountAdmin();
    
    // Test teacher - check that teacher permissions are correctly filtered
    renderWithResources(['teacher'], {});
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    
    // Teachers should see attendanceSessions is NOT available because teachers only have 
    // permissions for attendanceRecords, not attendanceSessions
    expect(screen.queryByTestId('menu-attendanceSessions')).not.toBeInTheDocument(); 
    
    // But teachers should see substitutions (they have permission)
    expect(screen.getByTestId('menu-substitutions')).toBeInTheDocument();
  });
});
