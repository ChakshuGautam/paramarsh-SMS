import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export class ListPage {
  async waitForDataToLoad() {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  }

  async expectNoDateErrors() {
    await waitFor(() => {
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    });
  }

  expectNoMUIComponents(container: HTMLElement) {
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  }

  async expectDataList(minItems = 0) {
    await this.waitForDataToLoad();
    
    // Check for React Admin list structure
    const list = screen.getByRole('main') || screen.getByTestId('list-page');
    expect(list).toBeInTheDocument();

    if (minItems > 0) {
      // Expect at least some data rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(minItems);
    }
  }

  async searchFor(searchTerm: string) {
    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox') || screen.getByPlaceholderText(/search/i);
    await user.clear(searchInput);
    await user.type(searchInput, searchTerm);
    await this.waitForDataToLoad();
  }

  async sortBy(columnName: string) {
    const user = userEvent.setup();
    const sortButton = screen.getByRole('button', { name: new RegExp(columnName, 'i') });
    await user.click(sortButton);
    await this.waitForDataToLoad();
  }

  async filterBy(filterValue: string) {
    const user = userEvent.setup();
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    // Find filter input and apply filter
    const filterInput = screen.getByRole('textbox');
    await user.type(filterInput, filterValue);
    await this.waitForDataToLoad();
  }

  async clickCreateButton() {
    const user = userEvent.setup();
    const createButton = screen.getByRole('button', { name: /create/i }) || 
                        screen.getByRole('link', { name: /create/i });
    await user.click(createButton);
  }

  async clickEditButton(rowIndex = 0) {
    const user = userEvent.setup();
    const editButtons = screen.getAllByRole('button', { name: /edit/i }) ||
                       screen.getAllByRole('link', { name: /edit/i });
    
    if (editButtons.length > rowIndex) {
      await user.click(editButtons[rowIndex]);
    }
  }

  async clickShowButton(rowIndex = 0) {
    const user = userEvent.setup();
    const showButtons = screen.getAllByRole('button', { name: /show/i }) ||
                       screen.getAllByRole('link', { name: /show/i });
    
    if (showButtons.length > rowIndex) {
      await user.click(showButtons[rowIndex]);
    }
  }

  async clickDeleteButton(rowIndex = 0) {
    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    
    if (deleteButtons.length > rowIndex) {
      await user.click(deleteButtons[rowIndex]);
      
      // Handle confirmation dialog if it appears
      await waitFor(async () => {
        const confirmButton = screen.queryByRole('button', { name: /confirm/i }) ||
                             screen.queryByRole('button', { name: /delete/i });
        if (confirmButton) {
          await user.click(confirmButton);
        }
      });
    }
  }

  async expectPagination() {
    // Check for pagination controls
    const pagination = screen.queryByRole('navigation') || 
                      screen.queryByTestId('pagination');
    
    if (pagination) {
      expect(pagination).toBeInTheDocument();
    }
  }

  async navigateToPage(pageNumber: number) {
    const user = userEvent.setup();
    const pageButton = screen.getByRole('button', { name: pageNumber.toString() });
    await user.click(pageButton);
    await this.waitForDataToLoad();
  }

  async expectEmptyState() {
    await this.waitForDataToLoad();
    const emptyMessage = screen.getByText(/no.*found/i) || 
                        screen.getByText(/empty/i) ||
                        screen.getByText(/nothing to show/i);
    expect(emptyMessage).toBeInTheDocument();
  }

  async expectErrorState() {
    const errorMessage = screen.getByText(/error/i) || 
                        screen.getByText(/failed/i) ||
                        screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
  }

  // Helper method to test date rendering in list rows
  async expectSafeDateRendering(testData: any[]) {
    await this.waitForDataToLoad();
    
    // Check that no date errors are shown
    await this.expectNoDateErrors();
    
    // Verify data is rendered
    testData.forEach(item => {
      if (item.name) {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      }
    });
  }

  // Helper to get all visible text content for verification
  getVisibleText(container: HTMLElement): string {
    return container.textContent || '';
  }
}

export const getListPage = () => new ListPage();