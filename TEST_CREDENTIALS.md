# Paramarsh SMS - Test Credentials

## Authentication System
- **Provider**: Clerk Authentication
- **Multi-tenancy**: School + Branch selection required at login

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

## Login Process

1. Navigate to: `http://localhost:3001/sign-in`
2. Select your **School** from the dropdown
3. Select your **Branch** from the filtered options
4. Enter **Username** and **Password**
5. Click **Sign In**

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

---
**Last Updated**: January 2025
**Security Level**: Development/Testing Only