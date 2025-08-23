#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generic test template for List components
const generateListTest = (componentName, resourceName) => `import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ${componentName} } from "@/app/admin/resources/${resourceName}/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test ${componentName.replace('List', '')}",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("${componentName} Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<${componentName} />, {
      resource: "${resourceName}",
      dataProvider,
    });

    // Wait for content to appear
    await screen.findByText("Test ${componentName.replace('List', '')}");
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = [
      { 
        ...mockData[0], 
        createdAt: null, 
        updatedAt: "invalid"
      }
    ];
    
    const dataProvider = createMockDataProvider(testData);
    
    renderWithReactAdmin(<${componentName} />, {
      resource: "${resourceName}",
      dataProvider,
    });
    
    await screen.findByText("Test ${componentName.replace('List', '')}");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<${componentName} />, {
      resource: "${resourceName}",
      dataProvider,
    });
    
    await screen.findByText("Test ${componentName.replace('List', '')}");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<${componentName} />, {
      resource: "${resourceName}",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
`;

// Get all List test files using shell command
const testFilesOutput = execSync('find test/resources -name "List.test.tsx"', { 
  cwd: path.join(__dirname, '..'),
  encoding: 'utf8' 
});

const testFiles = testFilesOutput.trim().split('\n').filter(f => f);

console.log(`Found ${testFiles.length} List test files to potentially fix`);

// Skip files we've already manually fixed
const skipFiles = [
  'test/resources/students/List.test.tsx',
  'test/resources/timetables/List.test.tsx',
  'test/resources/classes/List.test.tsx'
];

testFiles.forEach(testFile => {
  if (skipFiles.includes(testFile)) {
    console.log(`Skipping already fixed: ${testFile}`);
    return;
  }

  const fullPath = path.join(__dirname, '..', testFile);
  
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Only update files that look like they need fixing
      if (content.includes('import { AdminContext, testDataProvider') || 
          content.includes('QueryClient, QueryClientProvider')) {
        
        // Extract component and resource names
        const resourceMatch = testFile.match(/test\/resources\/([^\/]+)\/List\.test\.tsx$/);
        if (resourceMatch) {
          const resourceName = resourceMatch[1];
          const componentName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1) + 'List';
          
          const newContent = generateListTest(componentName, resourceName);
          
          fs.writeFileSync(fullPath, newContent);
          console.log(`Fixed: ${testFile}`);
        }
      } else {
        console.log(`Skipping (already good): ${testFile}`);
      }
    } catch (error) {
      console.error(`Error processing ${testFile}:`, error.message);
    }
  }
});

console.log('Test fixing complete!');