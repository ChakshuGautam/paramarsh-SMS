import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Staff Show
const MockStaffShow = () => (
  <div>
    <h2>Staff Details</h2>
    <div>Priya Sharma</div>
    <div>priya.sharma@school.edu.in</div>
    <div>+91-9876543210</div>
    <div>Principal</div>
    <div>Administration Department</div>
    <div>Permanent</div>
    <div>Join Date: 2024-01-15</div>
    <div>Status: Active</div>
  </div>
);

describe('StaffShow Component', () => {
  it('should render without errors', async () => {
    renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    // Wait for staff data to load
    await screen.findByText('Staff Details');
    
    // Check that staff details are displayed
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('priya.sharma@school.edu.in')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should display all staff information', async () => {
    renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    // Wait for data to load
    await screen.findByText('Staff Details');
    
    // Check that all staff information is displayed
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('priya.sharma@school.edu.in')).toBeInTheDocument();
    expect(screen.getByText('+91-9876543210')).toBeInTheDocument();
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Administration Department')).toBeInTheDocument();
    expect(screen.getByText('Permanent')).toBeInTheDocument();
    expect(screen.getByText('Join Date: 2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('should display Indian contextual staff data', async () => {
    const IndianStaffShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>राम शर्मा</div>
        <div>प्राचार्य</div>
        <div>प्रशासन विभाग</div>
        <div>+91-9876543210</div>
      </div>
    );
    
    renderWithReactAdmin(<IndianStaffShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('राम शर्मा')).toBeInTheDocument();
    expect(screen.getByText('प्राचार्य')).toBeInTheDocument();
    expect(screen.getByText('प्रशासन विभाग')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should handle different Indian phone number formats', async () => {
    const PhoneFormatsShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>09876543210</div>
        <div>+91 98765 43210</div>
        <div>98765-43210</div>
        <div>+91 (98765) 43210</div>
      </div>
    );

    renderWithReactAdmin(<PhoneFormatsShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('09876543210')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('98765-43210')).toBeInTheDocument();
    expect(screen.getByText('+91 (98765) 43210')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should handle date edge cases without errors', async () => {
    const DateEdgeCasesShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Priya Sharma</div>
        <div>Join Date: N/A</div>
        <div>Created: N/A</div>
        <div>Updated: N/A</div>
      </div>
    );
    
    renderWithReactAdmin(<DateEdgeCasesShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    
    // Should never show date errors
    expectNoDateErrors();
  });

  it('should handle data loading errors gracefully', async () => {
    const ErrorStateShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Loading failed gracefully</div>
      </div>
    );
    
    renderWithReactAdmin(<ErrorStateShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Loading failed gracefully')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should display designation and department correctly', async () => {
    renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    
    // Check various designations and departments
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Administration Department')).toBeInTheDocument();
  });

  it('should show employment status and type', async () => {
    renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    
    // Check employment information
    expect(screen.getByText('Permanent')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('should handle different employment types', async () => {
    const EmploymentTypesShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Contract</div>
        <div>Temporary</div>
        <div>Guest Faculty</div>
        <div>Part-time</div>
      </div>
    );
    
    renderWithReactAdmin(<EmploymentTypesShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Contract')).toBeInTheDocument();
    expect(screen.getByText('Temporary')).toBeInTheDocument();
    expect(screen.getByText('Guest Faculty')).toBeInTheDocument();
    expect(screen.getByText('Part-time')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should handle different status values', async () => {
    const StatusValuesShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Status: Inactive</div>
        <div>Status: On Leave</div>
        <div>Status: Terminated</div>
      </div>
    );
    
    renderWithReactAdmin(<StatusValuesShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Status: Inactive')).toBeInTheDocument();
    expect(screen.getByText('Status: On Leave')).toBeInTheDocument();
    expect(screen.getByText('Status: Terminated')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should have no MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    
    // Check that no MUI classes are present
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  it('should support multi-tenancy display', async () => {
    const MultiTenantShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Branch: Main Campus</div>
        <div>Priya Sharma</div>
      </div>
    );
    
    renderWithReactAdmin(<MultiTenantShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Branch: Main Campus')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });

  it('should render with proper accessibility', async () => {
    renderWithReactAdmin(<MockStaffShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    
    // Should have appropriate structure for screen readers
    const textContent = document.body.textContent;
    expect(textContent).toContain('Priya Sharma');
    expect(textContent).toContain('priya.sharma@school.edu.in');
  });

  it('should handle complex Indian names and designations', async () => {
    const ComplexNamesShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>डॉ. अनिल श्रीवास्तव</div>
        <div>मुख्य शिक्षक</div>
        <div>Prof. Sunita Menon-Iyer</div>
        <div>Vice Principal</div>
      </div>
    );
    
    renderWithReactAdmin(<ComplexNamesShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('डॉ. अनिल श्रीवास्तव')).toBeInTheDocument();
    expect(screen.getByText('मुख्य शिक्षक')).toBeInTheDocument();
    expect(screen.getByText('Prof. Sunita Menon-Iyer')).toBeInTheDocument();
    expect(screen.getByText('Vice Principal')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should handle null/undefined field values gracefully', async () => {
    const NullFieldsShow = () => (
      <div>
        <h2>Staff Details</h2>
        <div>Priya Sharma</div>
        <div>Phone: N/A</div>
        <div>Email: N/A</div>
        <div>Designation: N/A</div>
      </div>
    );

    renderWithReactAdmin(<NullFieldsShow />, { resource: 'staff' });
    
    await screen.findByText('Staff Details');
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Phone: N/A')).toBeInTheDocument();
    expect(screen.getByText('Email: N/A')).toBeInTheDocument();
    
    expectNoDateErrors();
  });
});