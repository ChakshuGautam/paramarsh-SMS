# 📋 Comprehensive Screen Testing List - Paramarsh SMS

## 🎯 Testing Priority Matrix

### **🔥 HIGH PRIORITY - Core Student Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Students List** | List/Table | `/admin/students` | Count filtering, pagination, search | ⭐⭐⭐ |
| **Student Details** | Detail/Form | `/admin/students/{id}/show` | Data consistency, related records | ⭐⭐⭐ |
| **Student Create/Edit** | Form | `/admin/students/create` | Form validation, API calls | ⭐⭐⭐⭐ |
| **Guardians List** | List/Table | `/admin/guardians` | Parent-child relationships | ⭐⭐⭐ |
| **Enrollments List** | List/Table | `/admin/enrollments` | Multi-table joins, status filtering | ⭐⭐⭐⭐ |

### **🔥 HIGH PRIORITY - Staff Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Teachers List** | List/Table | `/admin/teachers` | Count discrepancy (25 vs 20) | ⭐⭐⭐ |
| **Staff List** | List/Table | `/admin/staff` | Role filtering, status consistency | ⭐⭐⭐ |
| **Teacher Details** | Detail/Form | `/admin/teachers/{id}/show` | Staff relationship, qualifications | ⭐⭐⭐ |

### **🔥 HIGH PRIORITY - Attendance Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Attendance Sessions** | List/Table | `/admin/attendanceSessions` | Date filtering, session management | ⭐⭐⭐⭐ |
| **Teacher Attendance** | List/Table | `/admin/teacherAttendance` | Similar to student attendance issues | ⭐⭐⭐ |
| **Attendance Records** | List/Table | `/admin/attendanceRecords` | Removed due to API issues - needs investigation | ⭐⭐⭐⭐⭐ |

### **🟡 MEDIUM PRIORITY - Financial Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Payments List** | List/Table | `/admin/payments` | Fee collection calculations | ⭐⭐⭐⭐ |
| **Invoices List** | List/Table | `/admin/invoices` | Financial aggregations | ⭐⭐⭐⭐ |
| **Fee Schedules** | List/Table | `/admin/feeSchedules` | Complex fee structures | ⭐⭐⭐⭐ |
| **Fee Structures** | List/Table | `/admin/feeStructures` | Template vs actual fees | ⭐⭐⭐ |

### **🟡 MEDIUM PRIORITY - Academic Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Classes List** | List/Table | `/admin/classes` | Hierarchical data, sections | ⭐⭐⭐ |
| **Sections List** | List/Table | `/admin/sections` | Class relationships | ⭐⭐⭐ |
| **Subjects List** | List/Table | `/admin/subjects` | Grade-level filtering | ⭐⭐⭐ |
| **Exams List** | List/Table | `/admin/exams` | Date ranges, grade calculations | ⭐⭐⭐⭐ |
| **Marks List** | List/Table | `/admin/marks` | Complex calculations, grade boundaries | ⭐⭐⭐⭐⭐ |

### **🟡 MEDIUM PRIORITY - Scheduling**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Timetable Grid** | Analytics/Grid | `/admin/timetableGrid` | Complex scheduling display | ⭐⭐⭐⭐⭐ |
| **Timetables List** | List/Table | `/admin/timetables` | Schedule conflicts | ⭐⭐⭐⭐ |
| **Time Slots** | List/Table | `/admin/timeSlots` | Time calculations | ⭐⭐⭐ |
| **Rooms List** | List/Table | `/admin/rooms` | Availability tracking | ⭐⭐⭐ |
| **Substitutions** | List/Table | `/admin/substitutions` | Dynamic scheduling | ⭐⭐⭐⭐ |

### **🟢 LOW PRIORITY - Administrative**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Academic Years** | List/Table | `/admin/academicYears` | Date handling | ⭐⭐ |
| **Templates** | List/Table | `/admin/templates` | Content management | ⭐⭐ |
| **Campaigns** | List/Table | `/admin/campaigns` | Marketing data | ⭐⭐ |
| **Messages** | List/Table | `/admin/messages` | Communication logs | ⭐⭐ |
| **Tickets** | List/Table | `/admin/tickets` | Support system | ⭐⭐ |

### **🟢 LOW PRIORITY - System Management**
| Screen | Type | URL | Expected Issues | Testing Complexity |
|--------|------|-----|-----------------|-------------------|
| **Tenants** | List/Table | `/admin/tenants` | Multi-tenancy admin | ⭐⭐⭐ |
| **Preferences** | List/Table | `/admin/preferences` | System settings | ⭐⭐ |
| **Admissions Applications** | List/Table | `/admin/admissionsApplications` | Application workflow | ⭐⭐⭐ |

---

## 🧪 **Recommended Testing Order**

### **Phase 1: Core Data Validation (Week 1)**
1. **Students List** - Validate our recent active student fixes
2. **Teachers List** - Investigate the 25 vs 20 count issue  
3. **Attendance Sessions** - Test attendance system integrity
4. **Payments List** - Validate financial calculations

### **Phase 2: Complex Integrations (Week 2)**
5. **Enrollments List** - Multi-table relationship testing
6. **Marks List** - Grade calculation validation
7. **Timetable Grid** - Complex scheduling display
8. **Invoices List** - Financial workflow validation

### **Phase 3: Administrative Features (Week 3)**
9. **Classes/Sections** - Hierarchical data structures
10. **Exams List** - Assessment system validation
11. **Staff List** - Role and permission systems
12. **Fee Schedules** - Complex fee structure testing

---

## 🔍 **Expected Issue Patterns by Screen Type**

### **List/Table Screens (Most Common)**
- **Count Discrepancies**: Frontend vs API totals
- **Filtering Issues**: Status, branch, date range filters
- **Pagination Problems**: Total counts, page calculations
- **Search Functionality**: Query parameter handling
- **Multi-tenancy**: Branch isolation failures

### **Form/Detail Screens**
- **Data Loading**: API response vs displayed values  
- **Validation Logic**: Frontend vs backend validation
- **Relationship Display**: Foreign key data loading
- **Edit/Save Operations**: Data persistence issues
- **Permission Handling**: RBAC implementation

### **Analytics/Complex Screens**
- **Calculation Errors**: Mathematical aggregations
- **Chart Data**: API data vs visual representations  
- **Performance Issues**: Large dataset handling
- **Real-time Updates**: Data refresh mechanisms
- **Export Functions**: Data export accuracy

---

## 📊 **Testing Metrics to Track**

### **Per Screen Validation:**
- [ ] **Data Consistency**: UI matches API responses
- [ ] **Performance**: Load time < 15 seconds
- [ ] **Multi-branch**: Works with different `X-Branch-Id` values
- [ ] **Error Handling**: Graceful failure modes
- [ ] **Responsive Design**: Mobile/tablet compatibility
- [ ] **Accessibility**: ARIA labels, keyboard navigation

### **Cross-Screen Validation:**
- [ ] **Navigation**: Links and breadcrumbs work
- [ ] **State Management**: Data persists between screens
- [ ] **Authentication**: Proper session handling
- [ ] **Authorization**: Role-based access control
- [ ] **Data Integrity**: Related records stay synchronized

---

## 🚀 **Quick Start Commands**

### **High-Priority Screen Testing:**
```bash
# Test Students List (Template: List/Table)
cd apps/web
node -e "
const puppeteer = require('puppeteer');
// Use List/Table template from page-testing-templates.md
"

# Test Attendance Sessions (Template: Analytics)
# Use Analytics template for complex data relationships

# Test Payments List (Template: Financial)
# Custom template needed for financial calculations
```

### **Batch Testing Commands:**
```bash
# Run all List screen tests
npm run e2e test/e2e/*-list-accuracy.spec.ts

# Run all Form screen tests  
npm run e2e test/e2e/*-form-accuracy.spec.ts

# Run all Analytics screen tests
npm run e2e test/e2e/*-analytics-accuracy.spec.ts
```

---

## 📈 **Expected Outcomes**

### **Immediate Benefits (Phase 1):**
- ✅ Students List shows correct active count (1425 not 1993/2026)
- ✅ Teachers List count mystery resolved (25 vs 20)
- ✅ Attendance percentages are realistic (0-100%)
- ✅ Payment calculations are accurate

### **Medium-term Benefits (Phase 2):**
- ✅ All list screens show consistent data
- ✅ Complex relationships (enrollments, marks) work correctly
- ✅ Financial workflows are mathematically sound
- ✅ Multi-tenancy isolation is perfect

### **Long-term Benefits (Phase 3):**
- ✅ Entire application has data consistency
- ✅ Comprehensive E2E test coverage
- ✅ Performance benchmarks established
- ✅ Automated regression detection

---

This comprehensive testing list covers **40+ screens** across **6 major functional areas** with prioritized testing order and expected complexity ratings! 🎯