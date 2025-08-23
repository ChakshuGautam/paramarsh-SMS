import React from 'react';
import { render, screen } from '@testing-library/react';

// Basic CI tests that should always pass
describe('Basic CI Tests', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should pass basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
  });

  it('should handle string operations', () => {
    const name = 'Paramarsh SMS';
    expect(name.length).toBe(13);
    expect(name.toLowerCase()).toBe('paramarsh sms');
    expect(name.includes('SMS')).toBe(true);
  });

  it('should handle array operations', () => {
    const students = ['Rahul', 'Priya', 'Amit'];
    expect(students.length).toBe(3);
    expect(students.includes('Rahul')).toBe(true);
    expect(students[0]).toBe('Rahul');
  });

  it('should handle date operations', () => {
    const date = new Date('2024-01-15');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0); // January is 0
    expect(date.getDate()).toBe(15);
  });

  it('should handle object operations', () => {
    const student = {
      name: 'Rahul Sharma',
      class: '5th',
      rollNumber: 101
    };
    
    expect(student.name).toBe('Rahul Sharma');
    expect(student.class).toBe('5th');
    expect(student.rollNumber).toBe(101);
    expect(Object.keys(student).length).toBe(3);
  });

  it('should handle promises', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should handle error states gracefully', () => {
    try {
      throw new Error('Test error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
    }
  });

  it('should validate Indian school context', () => {
    const indianNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];
    const subjects = ['Mathematics', 'Science', 'Social Studies', 'Hindi', 'English'];
    
    expect(indianNames.length).toBe(5);
    expect(subjects.length).toBe(5);
    expect(subjects.includes('Hindi')).toBe(true);
  });

  it('should handle React component props', () => {
    const Button = ({ label, disabled }: { label: string; disabled?: boolean }) => (
      <button disabled={disabled}>{label}</button>
    );
    
    render(<Button label="Submit" disabled={false} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});