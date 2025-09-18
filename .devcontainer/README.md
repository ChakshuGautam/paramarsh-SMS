# Paramarsh SMS Development Container

This development container provides a consistent, secure, and fully-configured environment for developing the Paramarsh SMS application.

## 🚀 Quick Start

1. **Install Prerequisites:**
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Container:**
   - Open this repository in VS Code
   - When prompted, click "Reopen in Container"
   - Or use Command Palette: `Cmd/Ctrl+Shift+P` → "Remote-Containers: Reopen in Container"

3. **Wait for Setup:**
   - First time setup takes 5-10 minutes
   - Subsequent starts are much faster (cached)

## 📦 What's Included

### Development Tools
- **Node.js 20** with npm, pnpm, and bun
- **PostgreSQL 15** pre-configured with database
- **NestJS CLI** for backend development
- **Prisma CLI** for database management
- **Playwright** for E2E testing
- **Git**, **ZSH with Oh My Zsh**, and productivity tools

### VS Code Extensions
- TypeScript/JavaScript support
- React/Next.js snippets
- Tailwind CSS IntelliSense
- Prisma syntax highlighting
- ESLint & Prettier
- GitLens & Git Graph
- GitHub Copilot
- Docker support
- And more!

### Pre-configured Services
- PostgreSQL database (`paramarsh_sms`)
- Database user: `paramarsh` / password: `paramarsh123`
- Auto port-forwarding for all services
- Persistent volumes for node_modules and database

## 🛠️ Development Commands

### Starting Services

```bash
# Backend API (NestJS)
cd apps/api && pnpm run start:dev

# Frontend (Next.js)
cd apps/web && pnpm run dev

# Both services concurrently
pnpm run dev
```

### Database Management

```bash
# Run migrations
cd apps/api && npx prisma migrate dev

# Open Prisma Studio
cd apps/api && npx prisma studio

# Generate Prisma client
cd apps/api && npx prisma generate

# Seed database
cd apps/api && npx prisma db seed
```

### Testing

```bash
# Run backend tests
cd apps/api && pnpm test

# Run frontend tests
cd apps/web && pnpm test

# Run E2E tests
cd apps/web && pnpm test:e2e

# Run specific test file
pnpm test -- path/to/test.spec.ts
```

### Useful Aliases

The container includes helpful aliases:
- `nr` → `npm run`
- `pr` → `pnpm run`
- `br` → `bun run`
- `gs` → `git status`
- `gc` → `git commit`
- `gp` → `git push`
- `ll` → `ls -la`

## 🔒 Security Features

### Network Firewall (Optional)
The container includes a firewall script that restricts network access to only necessary services:
- ✅ Allowed: npm, GitHub, Vercel, Clerk, PostgreSQL repos
- ❌ Blocked: All other external connections

To enable the firewall:
```bash
sudo /home/node/init-firewall.sh
```

To disable temporarily:
```bash
sudo iptables -P OUTPUT ACCEPT
```

### Secure Defaults
- Runs as non-root `node` user
- Isolated from host system
- Persistent volumes for data safety
- Security capabilities enabled

## 🗂️ Project Structure

```
/workspace/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/         # Shared packages
├── prisma/           # Database schema
└── .devcontainer/    # Container configuration
```

## 🌐 Access Points

When running in the container:

| Service | URL | Port |
|---------|-----|------|
| Frontend (Dev) | http://localhost:3000 | 3000 |
| Frontend | http://localhost:3001 | 3001 |
| Backend API | http://localhost:3005/api/v1 | 3005 |
| PostgreSQL | localhost:5432 | 5432 |
| Prisma Studio | http://localhost:5555 | 5555 |

## 🔧 Troubleshooting

### Container won't start
- Ensure Docker Desktop is running
- Check Docker has enough resources (4GB RAM minimum)
- Try: "Remote-Containers: Rebuild Container"

### Database connection issues
```bash
# Restart PostgreSQL
sudo service postgresql restart

# Check PostgreSQL status
sudo service postgresql status

# Verify connection
pg_isready -h localhost -p 5432 -U paramarsh
```

### Port already in use
- Check for processes using the port: `lsof -i :PORT`
- Kill the process: `kill -9 PID`
- Or change the port in `.devcontainer/devcontainer.json`

### Slow performance
- Increase Docker Desktop resources
- Ensure volumes are mounted with cache consistency
- Consider using WSL2 on Windows

## 🤝 Team Development

### Consistent Environment
- All team members get identical development setup
- No "works on my machine" issues
- Same Node.js, PostgreSQL, and tool versions

### Onboarding New Developers
1. Clone repository
2. Open in VS Code
3. Reopen in container
4. Start coding!

### Sharing Configuration
- Commit `.devcontainer/` folder to repository
- Team members automatically get updates
- Customize per-developer in `.devcontainer/local-settings.json`

## 📚 Additional Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Documentation](https://docs.docker.com/)
- [Paramarsh SMS Documentation](../README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 💡 Tips

1. **Rebuild container** after changing Dockerfile or devcontainer.json
2. **Use volumes** for persistent data (database, node_modules)
3. **Forward additional ports** as needed in devcontainer.json
4. **Customize shell** by editing ~/.zshrc
5. **Install additional tools** with apt-get or npm as needed

---

For issues or questions, please check the main [README](../README.md) or create an issue in the repository.