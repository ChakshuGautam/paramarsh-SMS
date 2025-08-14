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
          students: { name: 'students', hasList: true },
          guardians: { name: 'guardians', hasList: true },
          exams: { name: 'exams', hasList: true },
          classes: { name: 'classes', hasList: true },
          sections: { name: 'sections', hasList: true },
          enrollments: { name: 'enrollments', hasList: true },
          marks: { name: 'marks', hasList: true },
          invoices: { name: 'invoices', hasList: true },
          payments: { name: 'payments', hasList: true },
          attendanceRecords: { name: 'attendanceRecords', hasList: true },
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
  test('admin sees all resources', async () => {
    renderWithResources(['admin'], {
      students: {}, guardians: {}, exams: {}, classes: {}, sections: {},
      enrollments: {}, marks: {}, invoices: {}, payments: {}, attendanceRecords: {}
    });
    // all labels (query by testids for stability)
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    expect(screen.getByTestId('menu-guardians')).toBeInTheDocument();
    expect(screen.getByTestId('menu-exams')).toBeInTheDocument();
    expect(screen.getByTestId('menu-classes')).toBeInTheDocument();
    expect(screen.getByTestId('menu-sections')).toBeInTheDocument();
    expect(screen.getByTestId('menu-enrollments')).toBeInTheDocument();
    expect(screen.getByTestId('menu-marks')).toBeInTheDocument();
    expect(screen.getByTestId('menu-invoices')).toBeInTheDocument();
    expect(screen.getByTestId('menu-payments')).toBeInTheDocument();
    expect(screen.getByTestId('menu-attendanceRecords')).toBeInTheDocument();
  });

  test('teacher sees only allowed resources', async () => {
    renderWithResources(['teacher'], {
      students: {}, guardians: {}, exams: {}, classes: {}, sections: {},
      enrollments: {}, marks: {}, invoices: {}, payments: {}, attendanceRecords: {}
    });
    // visible
    expect(await screen.findByTestId('menu-students')).toBeInTheDocument();
    expect(screen.getByTestId('menu-exams')).toBeInTheDocument();
    expect(screen.getByTestId('menu-classes')).toBeInTheDocument();
    expect(screen.getByTestId('menu-sections')).toBeInTheDocument();
    expect(screen.getByTestId('menu-enrollments')).toBeInTheDocument();
    expect(screen.getByTestId('menu-marks')).toBeInTheDocument();
    expect(screen.getByTestId('menu-attendanceRecords')).toBeInTheDocument();
    // hidden
    expect(screen.queryByTestId('menu-invoices')).not.toBeInTheDocument();
    expect(screen.queryByTestId('menu-payments')).not.toBeInTheDocument();
    expect(screen.queryByTestId('menu-guardians')).not.toBeInTheDocument();
  });
});
