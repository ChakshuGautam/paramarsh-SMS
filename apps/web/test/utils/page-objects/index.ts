export { ListPage, getListPage } from './ListPage';
export { CreatePage, getCreatePage } from './CreatePage';
export { EditPage, getEditPage } from './EditPage';
export { ShowPage, getShowPage } from './ShowPage';

// Helper function to get all page objects for a resource
export const getResourcePageObjects = () => ({
  list: getListPage(),
  create: getCreatePage(),
  edit: getEditPage(),
  show: getShowPage()
});

// Common test data helpers for date testing
export const createDateTestScenarios = () => [
  { scenario: 'null date', value: null },
  { scenario: 'undefined date', value: undefined },
  { scenario: 'empty string', value: '' },
  { scenario: 'invalid string', value: 'not-a-date' },
  { scenario: 'invalid date format', value: 'invalid-date' },
  { scenario: 'valid ISO date', value: '2024-01-15T10:30:00Z' },
  { scenario: 'valid date string', value: '2024-01-15' },
  { scenario: 'timestamp number', value: 1705316400000 }
];

// Helper to create mock data with various date scenarios
export const createMockDataWithDates = (baseData: Record<string, any>) => {
  const dateScenarios = createDateTestScenarios();
  
  return dateScenarios.map((scenario, index) => ({
    id: index + 1,
    ...baseData,
    createdAt: scenario.value,
    updatedAt: scenario.value,
    name: `Test Item ${index + 1} (${scenario.scenario})`,
    description: `Test data with ${scenario.scenario}`
  }));
};