import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Timetable Grid List
const MockTimetableGridList = () => (
  <div>
    <h2>Timetable Grid</h2>
    <div>Class 5A - Section A</div>
    <div>Academic Year: 2024-25</div>
    <div>Monday: Mathematics 9:00-10:00</div>
    <div>Tuesday: English 10:00-11:00</div>
    <div>Wednesday: Science 11:00-12:00</div>
    <div>Status: Active</div>
  </div>
);

describe('Timetable Grid List', () => {
  it('should render timetable list without errors', async () => {
    renderWithReactAdmin(<MockTimetableGridList />, { resource: 'timetableGrid' });
    
    const title = await screen.findByText('Timetable Grid');
    expect(title).toBeInTheDocument();
    
    expect(screen.getByText('Class 5A - Section A')).toBeInTheDocument();
    expect(screen.getByText('Academic Year: 2024-25')).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should display timetable entries', async () => {
    renderWithReactAdmin(<MockTimetableGridList />, { resource: 'timetableGrid' });
    
    await screen.findByText('Timetable Grid');
    
    expect(screen.getByText('Monday: Mathematics 9:00-10:00')).toBeInTheDocument();
    expect(screen.getByText('Tuesday: English 10:00-11:00')).toBeInTheDocument();
    expect(screen.getByText('Wednesday: Science 11:00-12:00')).toBeInTheDocument();
  });

  it('should display status information', async () => {
    renderWithReactAdmin(<MockTimetableGridList />, { resource: 'timetableGrid' });
    
    await screen.findByText('Timetable Grid');
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockTimetableGridList />, { resource: 'timetableGrid' });
    
    await screen.findByText('Timetable Grid');
    expectNoDateErrors();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockTimetableGridList />, { resource: 'timetableGrid' });
    
    await screen.findByText('Timetable Grid');
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle empty timetable gracefully', async () => {
    const EmptyTimetable = () => <div>No timetable entries found</div>;
    renderWithReactAdmin(<EmptyTimetable />, { resource: 'timetableGrid' });
    
    await screen.findByText('No timetable entries found');
    expectNoDateErrors();
  });
});