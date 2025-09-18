# Paramarsh SMS - Test Credentials

## Authentication System
- **Provider**: Clerk Authentication
- **Multi-tenancy**: School + Branch selection required at login

## Universal Test User Accounts (Works for DPS, KVS, SPS, RIS)

⚠️ **Note**: These universal credentials work for all schools EXCEPT Swami Vivekanad Public School (SVPS). For SVPS, use the school-specific credentials below.

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

### Swami Vivekanad Public School (svps)
- Main Campus (main) → Branch ID: `svps-main`
- Senior Secondary Wing (senior) → Branch ID: `svps-senior`
- Junior Wing (junior) → Branch ID: `svps-junior`

## SVPS-Specific Login Credentials

### 🎓 SVPS Principal/Administrator Accounts
- **Username**: `svps.principal`
- **Password**: `Viv3kanand@SVPS#2024$Leader`
- **Email**: principal@svps.edu.in
- **Role**: admin
- **Access**: Full administrative access to SVPS branches only
- **Theme**: Named after Swami Vivekanand's leadership philosophy

### 👨‍🏫 SVPS Teacher Accounts
- **Username**: `svps.teacher`
- **Password**: `Sw@mi$Teach2024#Knowledge`
- **Email**: teacher@svps.edu.in
- **Role**: teacher
- **Access**: Teaching modules, student management, attendance for SVPS
- **Theme**: Emphasizes knowledge and teaching (Swami's core values)

### 📚 SVPS Student Accounts
- **Username**: `svps.student`
- **Password**: `Youth@Power#2024$Vivekanand`
- **Email**: student@svps.edu.in
- **Role**: student
- **Access**: Personal dashboard, assignments, grades for SVPS
- **Theme**: References Swami Vivekanand's youth empowerment message

### 👨‍👩‍👧‍👦 SVPS Parent/Guardian Accounts
- **Username**: `svps.parent`
- **Password**: `Par3nt@SVPS#Care2024$Strong`
- **Email**: parent@svps.edu.in
- **Role**: parent
- **Access**: Child's information, fees, attendance for SVPS only
- **Theme**: Emphasizes parental care and strength

## Login Process

1. Navigate to: `http://localhost:3001/sign-in`
2. Select your **School** from the dropdown
3. Select your **Branch** from the filtered options
4. Enter **Username** and **Password**
5. Click **Sign In**

## 🔐 Credential Access Control

### Universal Credentials Access
- **Schools**: Delhi Public School (DPS), Kendriya Vidyalaya (KVS), St. Paul's School (SPS), Ryan International School (RIS)
- **Branches**: All branches within the above schools
- **Usernames**: `admin`, `teacher`, `student`, `parent`

### SVPS-Specific Credentials Access
- **Schools**: Swami Vivekanad Public School (SVPS) ONLY
- **Branches**: `svps-main`, `svps-senior`, `svps-junior`
- **Usernames**: `svps.principal`, `svps.teacher`, `svps.student`, `svps.parent`
- **Restriction**: These credentials will NOT work for other schools (DPS, KVS, SPS, RIS)

### ⚠️ Important Access Rules
1. **Universal credentials** (`admin`, `teacher`, etc.) are **BLOCKED** for SVPS schools
2. **SVPS credentials** (`svps.principal`, `svps.teacher`, etc.) are **BLOCKED** for other schools
3. Each credential set is **completely isolated** and **school-specific**
4. **Multi-tenant security** ensures no cross-school data access

## Security Notes

- Passwords are designed to be secure and pass breach detection
- Each password contains:
  - Uppercase and lowercase letters
  - Numbers
  - Special characters (@, #, $)
  - Minimum 20 characters length
- Store these credentials securely
- For production, implement proper user registration and password reset flows

## API Headers

After authentication, the system sends these headers with each API request:
- `X-Branch-Id`: Composite ID (e.g., "dps-main")
- `X-School-Id`: School identifier (e.g., "dps")
- `X-Branch-Name`: Branch identifier (e.g., "main")
- `X-School-Name`: Full school name
- `X-Branch-Display-Name`: Full branch name
- `Authorization`: Bearer token from Clerk

## 📋 Quick Reference - SVPS Credentials Summary

| Role | Username | Password | Access Scope |
|------|----------|----------|--------------|
| **Principal/Admin** | `svps.principal` | `Viv3kanand@SVPS#2024$Leader` | Full admin access to SVPS branches only |
| **Teacher** | `svps.teacher` | `Sw@mi$Teach2024#Knowledge` | Teaching modules for SVPS only |
| **Student** | `svps.student` | `Youth@Power#2024$Vivekanand` | Student portal for SVPS only |
| **Parent** | `svps.parent` | `Par3nt@SVPS#Care2024$Strong` | Family portal for SVPS only |

### 🎯 SVPS Branch Options
- **svps-main** - Swami Vivekanad Public School - Main Campus
- **svps-senior** - Swami Vivekanad Public School - Senior Secondary Wing  
- **svps-junior** - Swami Vivekanad Public School - Junior Wing

### ✅ Verification Steps
1. Login with SVPS credentials should work ONLY for SVPS branches
2. Universal credentials (`admin`, `teacher`) should be BLOCKED for SVPS
3. SVPS credentials should be BLOCKED for other schools (DPS, KVS, SPS, RIS)
4. Each role should have appropriate permissions within SVPS system

---
**Last Updated**: January 2025
**Security Level**: Development/Testing Only
**SVPS Credentials**: School-Specific & Themed