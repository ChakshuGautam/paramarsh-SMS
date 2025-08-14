# SMS Admin Interface Migration Checklist

## Phase 1: Infrastructure Setup ⏳

### Core Components
- [x] **Add Tabs component from shadcn/ui** ✅
  - [x] Install via `npx shadcn-ui@latest add tabs`
  - [x] Verify import paths work correctly
  - [x] Test basic tab functionality

- [x] **Create FilterLiveForm component** ✅
  - [x] Already available from ra-core
  - [x] Implement real-time filter updates
  - [x] Add debounced search support
  - [x] Test with existing List context

- [x] **Create FilterCategory component** ✅
  - [x] Create `/components/admin/filter-category.tsx`
  - [x] Add icon support
  - [x] Implement collapsible sections
  - [x] Add translation support

- [x] **Enhance Count component** ✅
  - [x] Update `/components/admin/count.tsx`
  - [x] Add badge integration
  - [x] Support filter prop
  - [x] Test with real data

- [ ] **Create TabbedDataTable utility**
  - [ ] Create `/components/admin/tabbed-data-table.tsx`
  - [ ] Implement dynamic tab generation
  - [ ] Add store key management
  - [ ] Test filter integration

## Phase 2: High-Impact Lists Migration

### InvoicesList.tsx ✅
- [x] **Remove filter labels**
  - [x] Change to label={false} for all filters
  - [x] Add meaningful placeholders
- [x] **Implement tab-based status filtering**
  - [x] Add tabs for: Pending, Paid, Overdue, Cancelled
  - [x] Add Count badges to each tab
  - [x] Implement tab switching logic
- [x] **Add responsive columns**
  - [x] Add className="hidden md:table-cell" to non-essential columns
  - [x] Ensure mobile view shows key information
- [x] **Add status-based row styling**
  - [x] Implement rowClassName function
  - [x] Add colored borders for status indication

### StudentsList.tsx
- [ ] **Convert to label-less filters**
  - [ ] Remove all filter labels
  - [ ] Add placeholders
- [ ] **Implement sidebar filtering**
  - [ ] Create filter sidebar layout
  - [ ] Add FilterCategory for Class
  - [ ] Add FilterCategory for Section
  - [ ] Add FilterCategory for Gender
- [ ] **Add responsive design**
  - [ ] Hide non-essential columns on mobile
  - [ ] Ensure proper mobile layout
- [ ] **Consider enrollment status tabs**
  - [ ] Add tabs for: Active, Inactive, Transferred, Graduated

### AttendanceRecords List
- [ ] **Add date-based tab filtering**
  - [ ] Create tabs for: Today, This Week, This Month, Custom
  - [ ] Add count badges
- [ ] **Implement sidebar filtering**
  - [ ] Add Class filter category
  - [ ] Add Section filter category
  - [ ] Add Teacher filter category
- [ ] **Add attendance status indicators**
  - [ ] Visual indicators for Present/Absent/Late
  - [ ] Color-coded status display

### EnrollmentsList.tsx
- [ ] **Add status tabs**
  - [ ] Active, Inactive, Transferred, Graduated, Dropped
  - [ ] Count badges for each
- [ ] **Convert filters to label-less**
- [ ] **Add responsive columns**
- [ ] **Add period-based filtering in sidebar**

### ClassesList.tsx
- [ ] **Add grade level filtering**
  - [ ] Sidebar categories for grade ranges
- [ ] **Convert to label-less search**
- [ ] **Add capacity indicators**
- [ ] **Responsive design**

### SectionsList.tsx
- [ ] **Add class-based filtering tabs**
- [ ] **Show capacity utilization**
- [ ] **Convert filters to label-less**
- [ ] **Add responsive columns**

## Phase 3: Medium Impact Lists

### TeachersList.tsx
- [ ] **Add subject filtering sidebar**
  - [ ] FilterCategory for subjects
  - [ ] FilterCategory for qualifications
- [ ] **Implement status tabs**
  - [ ] Active, On Leave, Inactive
- [ ] **Add responsive design**
- [ ] **Consider grid layout option**

### MessagesList.tsx
- [ ] **Implement channel tabs**
  - [ ] SMS, Email, Push, WhatsApp
- [ ] **Add status filtering**
  - [ ] Pending, Sent, Delivered, Failed
- [ ] **Add sidebar for templates/campaigns**
- [ ] **Mobile-responsive cards**

### ExamsList.tsx
- [ ] **Add status tabs**
  - [ ] Upcoming, Ongoing, Completed
- [ ] **Date range filtering**
- [ ] **Subject/class sidebar filters**
- [ ] **Responsive design**

### StaffList.tsx
- [ ] **Department sidebar filtering**
- [ ] **Status tabs**
- [ ] **Designation categories**
- [ ] **Responsive columns**

## Phase 4: Specialized Lists

### FeeSchedulesList.tsx
- [ ] **Frequency-based tabs**
  - [ ] Monthly, Quarterly, Annual
- [ ] **Amount range filtering**
- [ ] **Status indicators**
- [ ] **Responsive design**

### FeeStructuresList.tsx
- [ ] **Class-based tabs**
- [ ] **Component filtering sidebar**
- [ ] **Amount visualization**
- [ ] **Responsive layout**

### GuardiansList.tsx
- [ ] **Relationship filtering**
- [ ] **Student count indicators**
- [ ] **Contact status**
- [ ] **Responsive design**

### PaymentsList.tsx
- [ ] **Status tabs** (Pending, Completed, Failed, Refunded)
- [ ] **Date range filtering**
- [ ] **Amount range sidebar**
- [ ] **Payment method filters**

## Common Patterns for All Lists

### Filter Improvements
- [ ] All filters should be label-less with placeholders
- [ ] Use AutocompleteInput for reference fields
- [ ] Consistent filter placement
- [ ] Live search implementation

### Responsive Design
- [ ] Hide non-essential columns on mobile
- [ ] Use className="hidden md:table-cell"
- [ ] Ensure key information visible on small screens
- [ ] Test on various device sizes

### Visual Enhancements
- [ ] Status-based row coloring
- [ ] Count badges in tabs
- [ ] Consistent icon usage
- [ ] Professional data presentation

### Performance
- [ ] Implement proper store keys for tabs
- [ ] Debounced search inputs
- [ ] Efficient filter updates
- [ ] Optimized re-renders

## Testing Checklist

### Component Testing
- [ ] Unit tests for FilterLiveForm
- [ ] Unit tests for FilterCategory
- [ ] Integration tests for TabbedDataTable
- [ ] Filter functionality tests

### Visual Testing
- [ ] Mobile responsiveness
- [ ] Tab switching
- [ ] Filter interactions
- [ ] Status indicators

### Performance Testing
- [ ] Large dataset filtering
- [ ] Search debouncing
- [ ] Tab switching speed
- [ ] Mobile performance

## Completion Status

**Phase 1:** 5/5 tasks complete ✅
**Phase 2:** 1/6 lists migrated ⏳
**Phase 3:** 0/4 lists migrated ⏳
**Phase 4:** 0/4 lists migrated ⏳

**Overall Progress:** 1/19 resources migrated (5%)

## Next Immediate Steps
1. Install Tabs component from shadcn/ui
2. Create FilterLiveForm component
3. Start with InvoicesList as pilot migration
4. Document learnings for next resources