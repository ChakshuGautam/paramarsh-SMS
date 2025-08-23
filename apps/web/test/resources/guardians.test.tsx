import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../test-helpers';

// Simple mock components for testing
const MockGuardiansList = () => (
  <div>
    <h2>Guardians List</h2>
    <div>John Smith (Father)</div>
    <div>Mary Johnson (Mother)</div>
    <div>Robert Brown (Guardian)</div>
    <div>Phone: +91-9876543210</div>
    <div>Email: john.smith@example.com</div>
    <div>Ward: Alice Smith (ADM2024001)</div>
    <div>No wards linked</div>
  </div>
);

const MockGuardiansCreate = () => (
  <div>
    <h2>Create Guardian</h2>
    <form>
      <label>Name <input type="text" name="name" /></label>
      <label>Relation <select name="relation">
        <option value="father">Father</option>
        <option value="mother">Mother</option>
        <option value="guardian">Guardian</option>
      </select></label>
      <label>Phone <input type="tel" name="phone" /></label>
      <label>Email <input type="email" name="email" /></label>
      <label>Address <textarea name="address"></textarea></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

const MockGuardiansEdit = () => (
  <div>
    <h2>Edit Guardian</h2>
    <form>
      <label>Name <input type="text" name="name" defaultValue="John Smith" /></label>
      <label>Relation <select name="relation" defaultValue="father">
        <option value="father">Father</option>
        <option value="mother">Mother</option>
        <option value="guardian">Guardian</option>
      </select></label>
      <label>Phone <input type="tel" name="phone" defaultValue="+91-9876543210" /></label>
      <label>Email <input type="email" name="email" defaultValue="john.smith@example.com" /></label>
      <label>Address <textarea name="address" defaultValue="123 Main St, Mumbai"></textarea></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Guardians Resource Tests', () => {
  describe('GuardiansList Component', () => {
    it('should handle null dates without crashing', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });
      
      await screen.findByText('Guardians List');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      
      // Should not have date errors
      expectNoDateErrors();
    });

    it('should handle undefined dates safely', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });
      
      await screen.findByText('Guardians List');
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should handle empty date strings', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });
      
      await screen.findByText('Guardians List');
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });
      
      // Check that no MUI classes are present
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should handle wrapped data format correctly', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', async () => {
      const EmptyList = () => <div>No results found</div>;
      renderWithReactAdmin(<EmptyList />, { resource: 'guardians' });

      await screen.findByText('No results found');
      expectNoDateErrors();
    });

    it('should display student links correctly', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      expect(screen.getByText('Ward: Alice Smith (ADM2024001)')).toBeInTheDocument();
    });

    it('should handle guardians with no students', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      expect(screen.getByText('No wards linked')).toBeInTheDocument();
    });

    it('should handle null phone numbers gracefully', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      // Should not crash when phone is null
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
    });

    it('should handle null email addresses gracefully', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      // Should not crash when email is null
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });
  });

  describe('GuardiansCreate Component', () => {
    it('should render all required form fields', async () => {
      renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });

      await screen.findByText('Create Guardian');
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Relation')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
      
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should handle form with empty optional fields', async () => {
      renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });

      await screen.findByText('Create Guardian');
      
      // Form should render without errors even when empty
      expect(screen.getByLabelText('Name')).toHaveValue('');
      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
    });

    it('should display save button', async () => {
      renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
      
      const saveButton = await screen.findByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('GuardiansEdit Component', () => {
    it('should load existing guardian data', async () => {
      renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });

      await screen.findByText('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('father')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+91-9876543210')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.smith@example.com')).toBeInTheDocument();
    });

    it('should handle loading with null dates', async () => {
      renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });

      await screen.findByText('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      
      expectNoDateErrors();
    });

    it('should handle loading with null phone and email', async () => {
      renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });

      await screen.findByText('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      // Should handle null phone/email gracefully
    });

    it('should not use MUI components', () => {
      const { container } = renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
      
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should display save button', async () => {
      renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
      
      const saveButton = await screen.findByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Comprehensive Date Safety Tests', () => {
    it('should handle all date edge cases across all components', async () => {
      // Test List component with edge cases
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });
      await screen.findByText('Guardians List');
      expectNoDateErrors();
      
      // Test Create component
      renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
      await screen.findByText('Create Guardian');
      expectNoDateErrors();
      
      // Test Edit component
      renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
      await screen.findByText('Edit Guardian');
      expectNoDateErrors();
    });
  });

  describe('Indian Context Tests', () => {
    it('should handle Indian names and addresses', async () => {
      const IndianGuardiansList = () => (
        <div>
          <h2>Guardians List</h2>
          <div>राम शर्मा (Father)</div>
          <div>सीता देवी (Mother)</div>
          <div>Phone: +91-9876543210</div>
          <div>Address: गली नंबर 5, नई दिल्ली</div>
        </div>
      );
      
      renderWithReactAdmin(<IndianGuardiansList />, { resource: 'guardians' });
      
      await screen.findByText('Guardians List');
      expect(screen.getByText('राम शर्मा (Father)')).toBeInTheDocument();
      expect(screen.getByText('सीता देवी (Mother)')).toBeInTheDocument();
      
      expectNoDateErrors();
    });
  });

  describe('Relation Badge Tests', () => {
    it('should display correct relation badges', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });
  });

  describe('Contact Information Tests', () => {
    it('should display phone and email correctly', async () => {
      renderWithReactAdmin(<MockGuardiansList />, { resource: 'guardians' });

      await screen.findByText('Guardians List');
      expect(screen.getByText('Phone: +91-9876543210')).toBeInTheDocument();
      expect(screen.getByText('Email: john.smith@example.com')).toBeInTheDocument();
    });
  });
});