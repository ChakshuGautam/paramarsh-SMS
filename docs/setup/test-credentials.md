# Paramarsh SMS - Test Credentials

## Authentication System
- **Provider**: Clerk Authentication
- **Multi-tenancy**: School + Branch selection required at login
- **Universal Access**: Same credentials work across ALL schools and branches

## Test User Accounts

### 1. Administrator
- **Username**: `admin`
- **Password**: `P@ramarsh#Admin2024$Secure`
- **Email**: admin@paramarsh.edu
- **Role**: admin
- **Access**: Full system access, all modules

### 2. Teacher
- **Username**: `teacher`
- **Password**: `Teach@Paramarsh#2024$Safe`
- **Email**: teacher@paramarsh.edu
- **Role**: teacher
- **Access**: Teaching modules, student management, attendance

### 3. Student
- **Username**: `student`
- **Password**: `Stud3nt@SMS#2024$Strong`
- **Email**: student@paramarsh.edu
- **Role**: student
- **Access**: Personal dashboard, assignments, grades

### 4. Parent
- **Username**: `parent`
- **Password**: `Par3nt@School#2024$Protect`
- **Email**: parent@paramarsh.edu
- **Role**: parent
- **Access**: Child's information, fees, attendance

## Available Schools & Branches

### Delhi Public School (dps)
- Main Campus (main) → Branch ID: `dps-main`
- North Campus (north) → Branch ID: `dps-north`
- South Campus (south) → Branch ID: `dps-south`
- East Campus (east) → Branch ID: `dps-east`
- West Campus (west) → Branch ID: `dps-west`

### Kendriya Vidyalaya (kvs)
- Central Branch (central) → Branch ID: `kvs-central`
- Cantonment Branch (cantonment) → Branch ID: `kvs-cantonment`
- Airport Branch (airport) → Branch ID: `kvs-airport`

### St. Paul's School (sps)
- Primary Wing (primary) → Branch ID: `sps-primary`
- Secondary Wing (secondary) → Branch ID: `sps-secondary`
- Senior Wing (senior) → Branch ID: `sps-senior`

### Ryan International School (ris)
- Main Branch (main) → Branch ID: `ris-main`
- Extension Branch (extension) → Branch ID: `ris-extension`

### Swami Vivekananda Public School (svps) ⭐ NEW
- Main Campus (main) → Branch ID: `svps-main`
- Senior Secondary Wing (senior) → Branch ID: `svps-senior`
- Junior Wing (junior) → Branch ID: `svps-junior`

## SVPS Branch Details

### SVPS Main Campus (svps-main)
- **Students**: 2,001 enrolled across all grades
- **Teachers**: 22 qualified staff members
- **Classes**: 15 classes (Nursery to Class 12)
- **Sections**: 4 sections per class
- **Specialization**: Full K-12 education with all streams

### SVPS Senior Secondary Wing (svps-senior)
- **Students**: 385 enrolled in Classes 11-12
- **Teachers**: 8 specialized senior secondary faculty
- **Classes**: 4 classes (Class 11-12, Science & Commerce streams)
- **Sections**: 2 sections per class
- **Specialization**: Higher secondary education with stream focus

### SVPS Junior Wing (svps-junior)
- **Students**: 946 enrolled in primary grades
- **Teachers**: 19 dedicated primary educators
- **Classes**: 11 classes (Nursery to Class 10)
- **Sections**: 3 sections per class
- **Specialization**: Primary and middle school education

## Login Process

1. Navigate to: `http://localhost:3001/sign-in`
2. Select **Swami Vivekananda Public School** from the School dropdown
3. Select your desired branch:
   - **Main Campus** (for full K-12 experience)
   - **Senior Secondary Wing** (for Classes 11-12 focus)
   - **Junior Wing** (for primary education focus)
4. Enter any of the test account credentials above
5. Click **Sign In**

## Demo Scenarios for SVPS

### For Administrators (`admin` account):
- **svps-main**: Experience full school management across all grades
- **svps-senior**: Focus on higher secondary administration
- **svps-junior**: Manage primary education operations

### For Teachers (`teacher` account):
- **svps-main**: Access comprehensive teaching tools across grade levels
- **svps-senior**: Work with senior secondary curriculum and students
- **svps-junior**: Manage primary and middle school classes

### For Students (`student` account):
- **svps-main**: Experience student portal with full academic features
- **svps-senior**: Access advanced student features for higher classes
- **svps-junior**: Use age-appropriate student interface

### For Parents (`parent` account):
- **svps-main**: Monitor children across different grade levels
- **svps-senior**: Track senior secondary student progress
- **svps-junior**: Stay connected with younger children's education

## Branch-Specific Features Available

### All SVPS Branches Support:
- ✅ Student Management (2,001 + 385 + 946 = 3,332 total students)
- ✅ Teacher Management (22 + 8 + 19 = 49 total staff)
- ✅ Attendance Tracking
- ✅ Examination System
- ✅ Fee Management
- ✅ Timetable Management
- ✅ Communication System
- ✅ Report Generation
- ✅ Multi-tenant Data Isolation

### SVPS-Specific Data Highlights:
- **Indian Context**: All data uses authentic Indian names, addresses (+91 phone numbers), and cultural context
- **Realistic Relationships**: Proper student-guardian, teacher-subject, and class-section associations
- **Academic Calendar**: Follows Indian academic year (April to March)
- **Fee Structure**: Indian education system fee components
- **Subjects**: CBSE curriculum with Hindi, regional considerations

## Security Notes

- All test credentials are universal and work across ALL schools and branches
- Passwords are designed to be secure and pass breach detection
- Each password contains:
  - Uppercase and lowercase letters
  - Numbers
  - Special characters (@, #, $)
  - Minimum 20 characters length
- Data is completely isolated between branches via branchId
- No cross-contamination between school branches

## API Headers

After authentication, the system sends these headers with each API request:
- `X-Branch-Id`: Composite ID (e.g., "svps-main", "svps-senior", "svps-junior")
- `X-School-Id`: School identifier ("svps")
- `X-Branch-Name`: Branch identifier ("main", "senior", "junior")
- `X-School-Name`: "Swami Vivekanad Public School"
- `X-Branch-Display-Name`: Full branch name
- `Authorization`: Bearer token from Clerk

## Quick Test Checklist for SVPS

### ✅ Login Tests
- [ ] Can access svps-main with admin credentials
- [ ] Can access svps-senior with teacher credentials
- [ ] Can access svps-junior with student credentials
- [ ] Can access all branches with parent credentials

### ✅ Data Verification
- [ ] Student lists show SVPS students only (no cross-branch data)
- [ ] Teachers are properly assigned to their SVPS branch
- [ ] Classes and sections match branch configuration
- [ ] Attendance, fees, and exams work correctly

### ✅ Multi-tenant Isolation
- [ ] SVPS data is isolated from DPS, KVS, SPS, RIS data
- [ ] Switching between SVPS branches shows different data sets
- [ ] API calls include correct svps-* branch IDs

---
**Last Updated**: January 2025  
**New SVPS Branches Added**: svps-main, svps-senior, svps-junior  
**Total Branches Available**: 16 branches across 5 schools  
**Security Level**: Development/Testing Only