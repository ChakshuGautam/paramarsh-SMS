# Getting Started with Paramarsh SMS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.0+
- SQLite (for development) or PostgreSQL (for production)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/paramarsh-sms.git
cd paramarsh-sms

# Install dependencies
bun install

# Setup database
cd apps/api
npx prisma migrate dev
npx prisma db seed

# Start development servers
# Terminal 1 - Backend (port 8080)
cd apps/api
bun run start:dev

# Terminal 2 - Frontend (port 3000)
cd apps/web
bun run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- API Documentation: http://localhost:8080/api

## 📁 Project Structure

```
paramarsh-sms/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── docs/
│   ├── global/       # Horizontal documentation
│   └── modules/      # Module-specific docs
├── scripts/          # Utility scripts
└── CLAUDE.md         # AI assistant instructions
```

## 🎯 Key Concepts

### 1. Multi-tenancy
Every API request requires a branch ID header:
```bash
curl -H "X-Branch-Id: branch1" http://localhost:8080/api/v1/students
```

### 2. API Response Format
All endpoints return data in React Admin format:
```json
{
  "data": [...],
  "total": 100
}
```

### 3. UI Components
Only use shadcn/ui components:
```tsx
// ✅ Correct
import { Button } from "@/components/ui/button"

// ❌ Wrong - Never use MUI
import { Button } from "@mui/material"
```

## 🧪 Running Tests

```bash
# Backend E2E tests
cd apps/api
bun run test:e2e

# Specific module test
bun run test:e2e students

# Frontend tests
cd apps/web
bun run test
```

## 🌱 Seed Data

The system comes with comprehensive Indian school context seed data:
- 500+ students with Indian names
- 30+ teachers with qualifications
- Complete fee structure
- Academic calendar (April-March)

To reset seed data:
```bash
cd apps/api
npx prisma db seed
```

## 🔧 Development Workflow

### Implementing a New Module

1. **Backend**: Create service extending BaseCrudService
2. **Tests**: Write E2E tests for all endpoints
3. **Frontend**: Create List, Create, Edit components
4. **Seed**: Add demo data to seed-indian.ts
5. **Validate**: Run validation script

```bash
# Validate implementation
./scripts/validate-api.sh [module-name]
```

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Port 8080 in use | Change port in apps/api/package.json |
| Database locked | Stop all processes and restart |
| API returns 404 | Check DataProvider path mappings |
| No data shown | Ensure API returns `{ data: [...] }` |

## 📚 Next Steps

1. Review [Architecture](01-ARCHITECTURE.md)
2. Understand [API Conventions](04-API-CONVENTIONS.md)
3. Check module guides in [modules/](../modules/)
4. Read [CLAUDE.md](../../CLAUDE.md) for AI assistance

## 🤝 Getting Help

- Check documentation in `docs/`
- Review existing implementations
- Use AI assistant with context from CLAUDE.md
- Run validation scripts for automated checks