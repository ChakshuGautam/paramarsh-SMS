import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore, DataProvider } from 'react-admin';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  dataProvider?: Partial<DataProvider>;
  initialEntries?: string[];
}

export function renderWithAdmin(
  ui: React.ReactElement,
  {
    dataProvider = {},
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const defaultDataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: { id: 1 } }),
    create: () => Promise.resolve({ data: { id: 1 } }),
    update: () => Promise.resolve({ data: { id: 1 } }),
    delete: () => Promise.resolve({ data: { id: 1 } }),
    getMany: () => Promise.resolve({ data: [] }),
    ...dataProvider,
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AdminContext dataProvider={defaultDataProvider} store={memoryStore()}>
        {children}
      </AdminContext>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export const mockDateData = {
  validDates: {
    id: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-02-15',
  },
  nullDates: {
    id: 2,
    createdAt: null,
    updatedAt: null,
    dueDate: null,
  },
  undefinedDates: {
    id: 3,
    createdAt: undefined,
    updatedAt: undefined,
    dueDate: undefined,
  },
  invalidDates: {
    id: 4,
    createdAt: 'invalid-date',
    updatedAt: '',
    dueDate: 'not-a-date',
  },
};

export const detectDateErrors = (getByTestId: any, getAllByText: any) => {
  const errors: string[] = [];
  
  try {
    const invalidTimeError = getAllByText(/Invalid time value/i);
    if (invalidTimeError.length > 0) {
      errors.push('Found "Invalid time value" error');
    }
  } catch {}
  
  try {
    const invalidDateError = getAllByText(/Invalid Date/i);
    if (invalidDateError.length > 0) {
      errors.push('Found "Invalid Date" rendering');
    }
  } catch {}
  
  return errors;
};

export const detectMUIImports = (container: HTMLElement) => {
  const muiClasses = container.querySelectorAll('[class*="Mui"], [class*="MuiPaper"], [class*="MuiButton"]');
  return muiClasses.length > 0;
};

export * from '@testing-library/react';