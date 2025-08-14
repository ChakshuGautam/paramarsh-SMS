# Timetable UI Guide

## Overview

The timetable UI provides multiple views for displaying and managing class schedules:

### 📅 **Grid View (Primary)** - `TimetableGrid.tsx`
**Layout**: Days (Y-axis) × Time Periods (X-axis)

```
         | Period 1    | Period 2    | Period 3    | Period 4    |
         | (09:00-10:00)| (10:00-11:00)| (11:00-12:00)| (12:00-13:00)|
---------|-------------|-------------|-------------|-------------|
Monday   | Math        | English     | Science     | Break       |
         | Ms. Smith   | Mr. Johnson | Dr. Brown   |             |
         | Room A101   | Room B205   | Lab 1       |             |
---------|-------------|-------------|-------------|-------------|
Tuesday  | Science     | Math        | English     | PE          |
         | Dr. Brown   | Ms. Smith   | Mr. Johnson | Coach Lee   |
         | Lab 1       | Room A101   | Room B205   | Gym         |
---------|-------------|-------------|-------------|-------------|
...      | ...         | ...         | ...         | ...         |
```

**Features**:
- ✅ Traditional timetable grid layout
- ✅ Shows subject, teacher, and room for each period
- ✅ Color-coded periods and status indicators
- ✅ Click-to-edit functionality (when editable=true)
- ✅ Free period indicators
- ✅ Responsive design with horizontal scrolling
- ✅ Visual legend and status badges

### 📋 **Week View** - `TimetableWeekView.tsx` 
**Layout**: Days (columns) with periods listed vertically

```
Monday     | Tuesday    | Wednesday  | Thursday   | Friday
Jan 15     | Jan 16     | Jan 17     | Jan 18     | Jan 19
-----------|------------|------------|------------|------------
[MATH]     | [SCI]      | [ENG]      | [HIST]     | [ART]
09:00      | 09:00      | 09:00      | 09:00      | 09:00
Ms. Smith  | Dr. Brown  | Mr. Johnson| Ms. Davis  | Ms. Wilson
Room A101  | Lab 1      | Room B205  | Room C301  | Art Studio
-----------|------------|------------|------------|------------
[ENG]      | [MATH]     | [PE]       | [SCI]      | [MUSIC]
10:00      | 10:00      | 10:00      | 10:00      | 10:00
...        | ...        | ...        | ...        | ...
```

**Features**:
- ✅ Week navigation with prev/next buttons
- ✅ Compact and full view modes
- ✅ Today highlighting
- ✅ Period time display
- ✅ Teacher and room information

### 🏠 **Main Timetables Page** - `/admin/timetables/page.tsx`
**Purpose**: Central hub for timetable management

**Features**:
- ✅ Section selector dropdown
- ✅ Export and settings options
- ✅ Auto-generation button
- ✅ Integration with both grid and week views

## Data Structure

### API Endpoints Used
```typescript
GET /api/v1/timetable/sections/{sectionId}  // Get periods for a section
GET /api/v1/timetable/time-slots            // Get all time slots
GET /api/v1/sections                         // Get all sections
```

### Key Data Models
```typescript
interface TimeSlot {
  id: string;
  dayOfWeek: number;    // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string;    // "09:00"
  endTime: string;      // "10:00"
  slotOrder: number;    // 1, 2, 3, 4... (period sequence)
  slotType: string;     // "regular" | "break" | "assembly"
}

interface TimetablePeriod {
  id: string;
  timeSlotId: string;
  timeSlot: TimeSlot;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    name: string;
    code: string;
  };
  isActive: boolean;
}
```

## Usage Examples

### 1. Display Section Timetable (Read-only)
```tsx
<TimetableGrid 
  sectionId="section-123"
  sectionName="Class 10A"
  editable={false}
/>
```

### 2. Editable Timetable with Period Click Handler
```tsx
<TimetableGrid 
  sectionId="section-123"
  editable={true}
  onPeriodClick={(timeSlotId, dayOfWeek) => {
    // Open edit modal or navigate to edit page
    openEditModal({ timeSlotId, dayOfWeek, sectionId: "section-123" });
  }}
/>
```

### 3. Week View with Navigation
```tsx
<TimetableWeekView 
  periods={weekPeriods}
  currentDate={selectedDate}
  onDateChange={setSelectedDate}
  compact={false}
/>
```

### 4. Compact Week Widget
```tsx
<TimetableWeekView 
  periods={periods}
  compact={true}
/>
```

## Navigation Structure

### Current Admin Routes
- `/admin/timetablePeriods` - Individual period CRUD (existing)
- `/admin/timetables` - Main timetable management page (new)
- `/admin/subjects` - Subject management
- `/admin/rooms` - Room management  
- `/admin/timeSlots` - Time slot configuration

### Recommended User Flow
1. **Setup Phase**:
   - Configure Time Slots (`/admin/timeSlots`)
   - Manage Rooms (`/admin/rooms`)
   - Setup Subjects (`/admin/subjects`)

2. **Timetable Creation**:
   - Use Auto Generation (`/admin/timetables` → Auto Generate button)
   - Or manually create periods (`/admin/timetables` → click grid cells)

3. **Daily Management**:
   - View timetables (`/admin/timetables`)
   - Handle substitutions
   - Monitor conflicts

## Visual Features

### Grid View Features
- **Subject Display**: Shows subject code as badge + full name
- **Teacher Info**: Teacher name with user icon
- **Room Info**: Room code with location icon  
- **Status Indicators**: Active/inactive periods, conflict warnings
- **Interactive Elements**: Hover effects, click handlers
- **Empty Cells**: "Click to add" for editable mode, "Free" for read-only

### Week View Features  
- **Date Navigation**: Previous/Next week buttons
- **Today Highlighting**: Blue ring around current day
- **Time Display**: Period start times with clock icon
- **Compact Mode**: Condensed view showing only first 3 periods
- **Responsive**: Adapts to screen size

### Color Coding
- **White Background**: Scheduled periods
- **Gray Background**: Free periods
- **Blue Accents**: Subject code badges, today highlighting
- **Opacity**: 50% for inactive periods
- **Hover Effects**: Blue tint on hoverable cells

## Integration with Existing Admin

The timetable components integrate seamlessly with the existing React Admin setup:

- **Permissions**: Respects role-based access control
- **Data Provider**: Uses the same API patterns
- **UI Components**: Consistent with shadcn/ui design system
- **Navigation**: Integrated with existing sidebar navigation

## Future Enhancements

Potential improvements for the timetable UI:

1. **Drag & Drop**: Move periods between time slots
2. **Conflict Detection**: Visual warnings for teacher/room conflicts  
3. **Bulk Operations**: Copy timetables between sections
4. **Print Views**: Optimized layouts for printing
5. **Mobile Views**: Touch-friendly interfaces for tablets
6. **Real-time Updates**: Live collaboration features
7. **Templates**: Save and reuse timetable patterns

## Technical Notes

- **Performance**: Grid renders efficiently with virtualization for large datasets
- **Accessibility**: Full keyboard navigation and screen reader support
- **Browser Support**: Works on all modern browsers with CSS Grid support
- **Mobile**: Horizontal scrolling on small screens, optimized touch targets
- **Loading States**: Skeleton screens while data loads
- **Error Handling**: Graceful fallbacks for API failures