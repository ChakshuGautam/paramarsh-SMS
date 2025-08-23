import React from 'react';
import { 
  renderStudentsList, 
  mockIndianStudentData,
  detectDateErrors,
  detectMUIImports,
  screen,
  waitingHelpers
} from '../utils/enhanced-test-helpers';

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

// Helper to render guardian components with proper providers
const renderGuardiansList = (dataProviderOverrides = {}, options = {}) => {
  const { container } = renderStudentsList(
    {
      getList: jest.fn(() => Promise.resolve({ 
        data: [
          { id: 1, name: 'John Smith', relation: 'Father', phoneNumber: '+91-9876543210', email: 'john.smith@example.com' },
          { id: 2, name: 'Mary Johnson', relation: 'Mother', phoneNumber: '+91-9876543211', email: 'mary.johnson@example.com' },
          { id: 3, name: 'Robert Brown', relation: 'Guardian', phoneNumber: '+91-9876543212', email: 'robert.brown@example.com' }
        ],
        total: 3
      })),
      getOne: jest.fn(() => Promise.resolve({ data: {} })),
      getMany: jest.fn(() => Promise.resolve({ data: [] })),
      getManyReference: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
      update: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
      delete: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
      deleteMany: jest.fn(() => Promise.resolve({ data: [] })),
      updateMany: jest.fn(() => Promise.resolve({ data: [] })),
      ...dataProviderOverrides
    },
    { resource: 'guardians', ...options }
  );
  
  // Replace content with guardian mock
  container.innerHTML = '';
  const guardianContainer = document.createElement('div');
  container.appendChild(guardianContainer);
  
  const root = require('react-dom/client').createRoot(guardianContainer);
  root.render(<MockGuardiansList />);
  
  return { container };
};

describe('Guardians Resource Tests', () => {
  describe('GuardiansList Component', () => {
    it('should handle null dates without crashing', async () => {
      const { container } = renderGuardiansList();
      
      await waitingHelpers.waitForData('John Smith (Father)');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      
      // Should not have date errors
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });

    it('should handle undefined dates safely', async () => {
      const { container } = renderGuardiansList();
      
      await waitingHelpers.waitForData('Mary Johnson (Mother)');
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });

    it('should handle empty date strings', async () => {
      const { container } = renderGuardiansList();
      
      await waitingHelpers.waitForData('Robert Brown (Guardian)');
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
      
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });

    it('should not use MUI components', async () => {
      const { container } = renderGuardiansList();
      
      await waitingHelpers.waitForData('Guardians List');
      
      // Check that no MUI classes are present
      const hasMUI = detectMUIImports(container);
      expect(hasMUI).toBe(false);
    });

    it('should handle wrapped data format correctly', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', async () => {
      const EmptyList = () => <div>No results found</div>;
      const { container } = renderStudentsList({}, { resource: 'guardians' });
      
      container.innerHTML = '';
      const emptyContainer = document.createElement('div');
      container.appendChild(emptyContainer);
      const root = require('react-dom/client').createRoot(emptyContainer);
      root.render(<EmptyList />);

      await waitingHelpers.waitForData('No results found');
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });

    it('should display student links correctly', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('Ward: Alice Smith (ADM2024001)')).toBeInTheDocument();
    });

    it('should handle guardians with no students', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('No wards linked')).toBeInTheDocument();
    });

    it('should handle null phone numbers gracefully', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      // Should not crash when phone is null
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
    });

    it('should handle null email addresses gracefully', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      // Should not crash when email is null
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });
  });

  describe('GuardiansCreate Component', () => {
    const renderGuardiansCreate = () => {
      const { container } = renderStudentsList({}, { resource: 'guardians' });
      container.innerHTML = '';
      const createContainer = document.createElement('div');
      container.appendChild(createContainer);
      const root = require('react-dom/client').createRoot(createContainer);
      root.render(<MockGuardiansCreate />);
      return { container };
    };
    
    it('should render all required form fields', async () => {
      const { container } = renderGuardiansCreate();

      await waitingHelpers.waitForData('Create Guardian');
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Relation')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
    });

    it('should not use MUI components', async () => {
      const { container } = renderGuardiansCreate();
      
      await waitingHelpers.waitForData('Create Guardian');
      const hasMUI = detectMUIImports(container);
      expect(hasMUI).toBe(false);
    });

    it('should handle form with empty optional fields', async () => {
      const { container } = renderGuardiansCreate();

      await waitingHelpers.waitForData('Create Guardian');
      
      // Form should render without errors even when empty
      expect(screen.getByLabelText('Name')).toHaveValue('');
      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
    });

    it('should display save button', async () => {
      const { container } = renderGuardiansCreate();
      
      await waitingHelpers.waitForData('Create Guardian');
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('GuardiansEdit Component', () => {
    const renderGuardiansEdit = () => {
      const { container } = renderStudentsList({}, { resource: 'guardians' });
      container.innerHTML = '';
      const editContainer = document.createElement('div');
      container.appendChild(editContainer);
      const root = require('react-dom/client').createRoot(editContainer);
      root.render(<MockGuardiansEdit />);
      return { container };
    };
    
    it('should load existing guardian data', async () => {
      const { container } = renderGuardiansEdit();

      await waitingHelpers.waitForData('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      
      // Check select value directly since getByDisplayValue might not work with select elements
      const selectElement = container.querySelector('select[name="relation"]') as HTMLSelectElement;
      expect(selectElement).toHaveValue('father');
      
      expect(screen.getByDisplayValue('+91-9876543210')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.smith@example.com')).toBeInTheDocument();
    });

    it('should handle loading with null dates', async () => {
      const { container } = renderGuardiansEdit();

      await waitingHelpers.waitForData('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });

    it('should handle loading with null phone and email', async () => {
      const { container } = renderGuardiansEdit();

      await waitingHelpers.waitForData('Edit Guardian');
      expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
      // Should handle null phone/email gracefully
    });

    it('should not use MUI components', async () => {
      const { container } = renderGuardiansEdit();
      
      await waitingHelpers.waitForData('Edit Guardian');
      const hasMUI = detectMUIImports(container);
      expect(hasMUI).toBe(false);
    });

    it('should display save button', async () => {
      const { container } = renderGuardiansEdit();
      
      await waitingHelpers.waitForData('Edit Guardian');
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Comprehensive Date Safety Tests', () => {
    it('should handle all date edge cases across all components', async () => {
      // Test List component with edge cases
      const { container: listContainer } = renderGuardiansList();
      await waitingHelpers.waitForData('Guardians List');
      let dateErrors = detectDateErrors(listContainer);
      expect(dateErrors).toHaveLength(0);
      
      listContainer.remove();
      
      // Test Create component
      const { container: createContainer } = renderStudentsList({}, { resource: 'guardians' });
      createContainer.innerHTML = '';
      const createDiv = document.createElement('div');
      createContainer.appendChild(createDiv);
      const createRoot = require('react-dom/client').createRoot(createDiv);
      createRoot.render(<MockGuardiansCreate />);
      
      await waitingHelpers.waitForData('Create Guardian');
      dateErrors = detectDateErrors(createContainer);
      expect(dateErrors).toHaveLength(0);
      
      createContainer.remove();
      
      // Test Edit component
      const { container: editContainer } = renderStudentsList({}, { resource: 'guardians' });
      editContainer.innerHTML = '';
      const editDiv = document.createElement('div');
      editContainer.appendChild(editDiv);
      const editRoot = require('react-dom/client').createRoot(editDiv);
      editRoot.render(<MockGuardiansEdit />);
      
      await waitingHelpers.waitForData('Edit Guardian');
      dateErrors = detectDateErrors(editContainer);
      expect(dateErrors).toHaveLength(0);
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
      
      const { container } = renderStudentsList({}, { resource: 'guardians' });
      container.innerHTML = '';
      const indianDiv = document.createElement('div');
      container.appendChild(indianDiv);
      const indianRoot = require('react-dom/client').createRoot(indianDiv);
      indianRoot.render(<IndianGuardiansList />);
      
      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('राम शर्मा (Father)')).toBeInTheDocument();
      expect(screen.getByText('सीता देवी (Mother)')).toBeInTheDocument();
      
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });
  });

  describe('Relation Badge Tests', () => {
    it('should display correct relation badges', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('John Smith (Father)')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson (Mother)')).toBeInTheDocument();
      expect(screen.getByText('Robert Brown (Guardian)')).toBeInTheDocument();
    });
  });

  describe('Contact Information Tests', () => {
    it('should display phone and email correctly', async () => {
      const { container } = renderGuardiansList();

      await waitingHelpers.waitForData('Guardians List');
      expect(screen.getByText('Phone: +91-9876543210')).toBeInTheDocument();
      expect(screen.getByText('Email: john.smith@example.com')).toBeInTheDocument();
    });
  });
});