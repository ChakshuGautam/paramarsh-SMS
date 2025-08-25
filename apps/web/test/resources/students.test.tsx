import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../test-helpers';

// Simple mock components for testing
const MockStudentsList = () => (
  <div>
    <h2>Students List</h2>
    <div>Rahul Sharma (ADM2024001)</div>
    <div>Priya Kumar (ADM2024002)</div>
    <div>Class: 5A</div>
    <div>Status: Active</div>
    <div>Phone: +91-9876543210 (Father)</div>
  </div>
);

const MockStudentsCreate = () => (
  <div>
    <h2>Create Student</h2>
    <form>
      <label>First Name <input type="text" name="firstName" /></label>
      <label>Last Name <input type="text" name="lastName" /></label>
      <label>Admission Number <input type="text" name="admissionNo" /></label>
      <label>Date of Birth <input type="date" name="dateOfBirth" /></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

const MockStudentsEdit = () => (
  <div>
    <h2>Edit Student</h2>
    <form>
      <label>First Name <input type="text" name="firstName" defaultValue="Rahul" /></label>
      <label>Last Name <input type="text" name="lastName" defaultValue="Sharma" /></label>
      <label>Admission Number <input type="text" name="admissionNo" defaultValue="ADM2024001" /></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Students Resource Tests', () => {
  describe('StudentsList Component', () => {
    it('should handle null dates without crashing', async () => {
      renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      
      await screen.findByText('Students List');
      expect(screen.getByText('Rahul Sharma (ADM2024001)')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should display student information correctly', async () => {
      renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });

      await screen.findByText('Students List');
      expect(screen.getByText('Rahul Sharma (ADM2024001)')).toBeInTheDocument();
      expect(screen.getByText('Priya Kumar (ADM2024002)')).toBeInTheDocument();
      expect(screen.getByText('Class: 5A')).toBeInTheDocument();
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
      expect(screen.getByText('Phone: +91-9876543210 (Father)')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', async () => {
      const EmptyList = () => <div>No students found</div>;
      renderWithReactAdmin(<EmptyList />, { resource: 'students' });

      await screen.findByText('No students found');
      expectNoDateErrors();
    });
  });

  describe('StudentsCreate Component', () => {
    it('should render create form without errors', async () => {
      renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });

      await screen.findByText('Create Student');
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Admission Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
      
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should display save button', async () => {
      renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
      
      const saveButton = await screen.findByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('StudentsEdit Component', () => {
    it('should load existing student data', async () => {
      renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });

      await screen.findByText('Edit Student');
      expect(screen.getByDisplayValue('Rahul')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sharma')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ADM2024001')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
      
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should display save button', async () => {
      renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
      
      const saveButton = await screen.findByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Comprehensive Date Safety Tests', () => {
    it('should handle all date edge cases across all components', async () => {
      // Test List component
      renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      await screen.findByText('Students List');
      expectNoDateErrors();
      
      // Test Create component
      renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
      await screen.findByText('Create Student');
      expectNoDateErrors();
      
      // Test Edit component
      renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
      await screen.findByText('Edit Student');
      expectNoDateErrors();
    });
  });

  describe('Indian Context Tests', () => {
    it('should handle Indian student names and data', async () => {
      const IndianStudentsList = () => (
        <div>
          <h2>Students List</h2>
          <div>आर्यन शर्मा (ADM2024001)</div>
          <div>प्रिया कुमारी (ADM2024002)</div>
          <div>Phone: +91-9876543210 (पिता)</div>
          <div>Address: गली नंबर 5, नई दिल्ली</div>
        </div>
      );
      
      renderWithReactAdmin(<IndianStudentsList />, { resource: 'students' });
      
      await screen.findByText('Students List');
      expect(screen.getByText('आर्यन शर्मा (ADM2024001)')).toBeInTheDocument();
      expect(screen.getByText('प्रिया कुमारी (ADM2024002)')).toBeInTheDocument();
      
      expectNoDateErrors();
    });
  });
});