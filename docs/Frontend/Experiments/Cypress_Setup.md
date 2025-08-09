# Cypress Setup for a Single Module

Goal
- Minimal Cypress E2E + Component Testing setup to validate one module (e.g., Students list) with mock APIs.

1) Install and init
- pnpm add -D cypress @cypress/vite-dev-server @testing-library/cypress
- npx cypress open (creates cypress/)

2) E2E example: cypress/e2e/students.cy.ts
```ts
describe('Students list', () => {
  it('searches and paginates', () => {
    cy.intercept('GET', '/api/experiments/students*', (req) => {
      const url = new URL(req.url)
      const q = url.searchParams.get('q')
      const data = q ? [{ id: '1', admissionNo: 'S-001', firstName: 'A', lastName: 'B' }] : []
      req.reply({ statusCode: 200, body: { data, total: data.length } })
    })
    cy.visit('/experiments/students')
    cy.findByPlaceholderText(/search/i).type('A{enter}')
    cy.contains('S-001').should('be.visible')
  })
})
```

3) Component test example: cypress/components/DataTable.cy.tsx
```tsx
import React from 'react'
import { mount } from 'cypress/react'
import { DataTable } from '../../../components/table/DataTable'

it('renders rows', () => {
  mount(
    <DataTable
      columns={[{ accessorKey: 'name', header: 'Name' }]}
      data={[{ name: 'Alice' }]}
      total={1}
      page={1}
      pageSize={10}
      onPageChange={() => {}}
    />
  )
  cy.contains('Alice').should('be.visible')
})
```

4) Tips
- Use data-testid or accessible labels for stable selectors.
- For Next.js App Router, run dev server on a port and point Cypress baseUrl.
- Mock server responses with cy.intercept for deterministic tests.

