# System Architecture

## 🏗️ Overview

Paramarsh SMS is built as a modern, scalable, multi-tenant school management system using a monorepo architecture with separate backend and frontend applications.

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
├─────────────────────────────────────────────────────────┤
│  Next.js App (React Admin)  │  Mobile Apps (Future)     │
├─────────────────────────────────────────────────────────┤
│                    API Gateway                           │
│                 (Next.js API Routes)                     │
├─────────────────────────────────────────────────────────┤
│                   Backend Services                       │
│                  NestJS REST API                         │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                            │
│              Prisma ORM + SQLite/PostgreSQL              │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. **Multi-Tenancy First**
Every entity is scoped to a branch/school through `branchId` field.

### 2. **API-First Design**
All functionality exposed through REST APIs following React Admin Data Provider specification.

### 3. **Service-Oriented Architecture**
Each module is independent with clear boundaries and interfaces.

### 4. **Database Agnostic**
Prisma ORM allows switching between SQLite (dev) and PostgreSQL (production).

### 5. **Soft Deletes**
Critical entities support soft deletes for data recovery and audit trails.

## 📦 Monorepo Structure

```
paramarsh-sms/
├── apps/
│   ├── api/                 # Backend application
│   │   ├── src/
│   │   │   ├── common/      # Shared utilities
│   │   │   ├── modules/     # Feature modules
│   │   │   └── main.ts      # Application entry
│   │   ├── prisma/          # Database schema
│   │   └── test/            # E2E tests
│   │
│   └── web/                 # Frontend application
│       ├── app/
│       │   ├── admin/       # Admin panel
│       │   └── api/         # API proxy routes
│       ├── components/      # Shared components
│       └── lib/             # Utilities
│
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── packages/                # Shared packages (future)
```

## 🔧 Backend Architecture (NestJS)

### Module Structure
Each feature is implemented as a NestJS module:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService]
})
export class StudentsModule {}
```

### Service Pattern
All services extend `BaseCrudService` for consistent CRUD operations:

```typescript
export class StudentsService extends BaseCrudService<Student> {
  constructor(prisma: PrismaService) {
    super(prisma, 'student', {
      searchFields: ['firstName', 'lastName', 'admissionNo'],
      defaultSort: { firstName: 'asc' }
    });
  }
}
```

### Controller Pattern
Controllers handle HTTP requests and enforce multi-tenancy:

```typescript
@Controller('students')
export class StudentsController {
  @Get()
  findAll(
    @Query() query: QueryDto,
    @Headers('x-branch-id') branchId: string
  ) {
    return this.service.findAll({ ...query, branchId });
  }
}
```

## 🎨 Frontend Architecture (Next.js + React Admin)

### Component Structure
```
app/admin/
├── resources/               # Resource components
│   ├── students/
│   │   ├── List.tsx        # List view
│   │   ├── Create.tsx      # Create form
│   │   ├── Edit.tsx        # Edit form
│   │   └── Show.tsx        # Detail view
│   └── ...
├── DataProvider.tsx        # API integration
└── Admin.tsx               # Admin configuration
```

### Data Provider
Handles all API communication following React Admin specification:

```typescript
const dataProvider = {
  getList: (resource, params) => {
    // Convert React Admin params to API format
    // Call API with proper headers
    // Return data in React Admin format
  },
  getOne: ...,
  create: ...,
  update: ...,
  delete: ...
}
```

### Component Pattern
All list components use consistent DataTable pattern:

```tsx
export const StudentsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="firstName" />
      <DataTable.Col source="lastName" />
      <DataTable.Col source="status">
        <StatusBadge />
      </DataTable.Col>
    </DataTable>
  </List>
);
```

## 🗄️ Database Architecture

### Schema Design Patterns

1. **Multi-Tenant Isolation**
```prisma
model Student {
  id       String  @id @default(uuid())
  branchId String? // Tenant identifier
  // ... other fields
}
```

2. **Soft Delete Pattern**
```prisma
model Student {
  deletedAt DateTime? // Null = active
  deletedBy String?   // User who deleted
}
```

3. **Audit Trail**
```prisma
model Student {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
  updatedBy String?
}
```

4. **Relationships**
```prisma
model Student {
  class     Class?    @relation(fields: [classId], references: [id])
  classId   String?
  guardians StudentGuardian[]
}
```

## 🔒 Security Architecture

### Authentication Flow
```
User Login → JWT Token → API Requests with Token → Validate & Authorize
```

### Authorization Layers

1. **Route Level**: JWT validation
2. **Resource Level**: Role-based access control (RBAC)
3. **Data Level**: Branch/tenant isolation
4. **Field Level**: Sensitive data masking

### Multi-Tenancy Enforcement
```typescript
// Every query includes branchId
const students = await prisma.student.findMany({
  where: { 
    branchId: req.headers['x-branch-id'],
    ...otherFilters 
  }
});
```

## 🚀 Deployment Architecture

### Development
```
SQLite → NestJS (8080) → Next.js (3000) → Browser
```

### Production
```
PostgreSQL → NestJS (Containerized) → Next.js (Vercel) → CDN → Users
```

### Environment Configuration
```env
# Development
DATABASE_URL="file:./dev.db"
API_URL="http://localhost:8080"

# Production
DATABASE_URL="postgresql://..."
API_URL="https://api.paramarsh.com"
```

## 📊 Data Flow

### Request Flow
```
1. User Action in UI
2. React Admin Component
3. Data Provider
4. Next.js API Route (Proxy)
5. NestJS Controller
6. Service Layer
7. Prisma ORM
8. Database
9. Response (reverse flow)
```

### Multi-Tenancy Flow
```
Request Header (X-Branch-Id) → Controller → Service → Database Query (WHERE branchId = ?)
```

## 🔄 Integration Architecture

### Internal Integrations
- Modules communicate through service interfaces
- Events for loose coupling (future)
- Shared database with foreign key constraints

### External Integrations
- Payment Gateway (Razorpay)
- SMS Gateway (MSG91)
- Email Service (SMTP/SendGrid)
- Cloud Storage (S3/Local)

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Database connection pooling
- Redis for caching (future)
- Load balancer ready

### Vertical Scaling
- Optimized database queries
- Pagination on all list endpoints
- Lazy loading of relationships
- Index optimization

### Performance Optimizations
- Response caching
- Database query optimization
- CDN for static assets
- Code splitting in frontend

## 🛠️ Development Workflow

### Local Development
```bash
# Start database
cd apps/api && npx prisma migrate dev

# Start backend
cd apps/api && bun run start:dev

# Start frontend
cd apps/web && bun run dev
```

### Testing Architecture
- Unit tests for services
- E2E tests for API endpoints
- Integration tests for workflows
- Frontend component tests

## 🔍 Monitoring & Observability

### Logging Strategy
- Structured logging (JSON)
- Log levels (ERROR, WARN, INFO, DEBUG)
- Correlation IDs for request tracking

### Metrics
- API response times
- Database query performance
- Error rates
- User activity

### Health Checks
- Database connectivity
- API availability
- Service dependencies

## 📝 Architecture Decisions

### Why NestJS?
- Enterprise-grade Node.js framework
- Excellent TypeScript support
- Modular architecture
- Built-in dependency injection

### Why Next.js?
- Full-stack React framework
- API routes for backend proxy
- Server-side rendering capability
- Excellent developer experience

### Why Prisma?
- Type-safe database client
- Excellent migrations system
- Database agnostic
- Great developer experience

### Why React Admin?
- Rapid admin panel development
- Consistent UI/UX
- Built-in CRUD operations
- Extensible and customizable

### Why Multi-Tenancy via branchId?
- Simple implementation
- Clear data isolation
- Easy to understand
- Flexible for future needs

## 🚨 Architecture Constraints

1. **No Direct Database Access**: All data access through Prisma
2. **No Business Logic in Controllers**: Keep controllers thin
3. **No MUI Components**: Use only shadcn/ui
4. **No Raw SQL**: Use Prisma queries or MCP tools
5. **Always Include branchId**: Every query must be tenant-scoped

## 📚 Further Reading

- [API Conventions](04-API-CONVENTIONS.md)
- [Database Design](05-DATABASE-DESIGN.md)
- [Security Patterns](10-SECURITY.md)
- [Deployment Guide](11-DEPLOYMENT.md)