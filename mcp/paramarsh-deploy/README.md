# Paramarsh Deploy MCP Server

An MCP (Model Context Protocol) server for deploying Paramarsh SMS to a remote server using PM2.

## Features

- 🚀 One-command deployment (pull, build, restart)
- 📊 PM2 process management
- 📝 Real-time log monitoring
- 🏥 Health checks for API and Web services
- 🔄 Zero-downtime deployments
- 🔒 SSH-based secure deployment

## Prerequisites

### On Your Local Machine
- Node.js 18+ or Bun
- SSH access to your deployment server
- Claude Desktop app

### On Your Server
- Ubuntu/Debian Linux (or similar)
- Node.js 18+ and Bun installed
- PM2 installed globally
- Git with SSH access to your repository
- Nginx or Caddy for reverse proxy
- Ports 10010 (frontend) and 10011 (backend) available

## Installation

### 1. Install Dependencies

```bash
cd mcp/paramarsh-deploy
bun install
bun run build
```

### 2. Configure Claude Desktop

Add this MCP server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "paramarsh-deploy": {
      "command": "node",
      "args": ["/path/to/paramarsh-SMS/mcp/paramarsh-deploy/dist/index.js"],
      "env": {}
    }
  }
}
```

### 3. Server Setup (One-time)

SSH into your server and run:

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/yourusername/paramarsh-SMS/main/mcp/paramarsh-deploy/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

Or manually:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install PM2
npm install -g pm2

# Create directories
mkdir -p ~/paramarsh-sms ~/logs

# Clone your repository
cd ~/paramarsh-sms
git clone git@github.com:yourusername/paramarsh-SMS.git .

# Install dependencies
cd apps/api && bun install
cd ../web && bun install

# Setup database
cd ../api
npx prisma generate
npx prisma migrate deploy

# Start with PM2
pm2 start ~/paramarsh-sms/ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configure Nginx

Create `/etc/nginx/sites-available/paramarsh`:

```nginx
# API Backend
server {
    server_name api.paramarsh-sms.theflywheel.in;
    
    location / {
        proxy_pass http://localhost:10011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.paramarsh-sms.theflywheel.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.paramarsh-sms.theflywheel.in/privkey.pem;
}

# Web Frontend
server {
    server_name paramarsh-sms.theflywheel.in;
    
    location / {
        proxy_pass http://localhost:10010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/paramarsh-sms.theflywheel.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paramarsh-sms.theflywheel.in/privkey.pem;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name paramarsh-sms.theflywheel.in api.paramarsh-sms.theflywheel.in;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/paramarsh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Usage in Claude

Once configured, you can use these commands in Claude:

### Configure Connection
```
Use the paramarsh-deploy MCP server to configure with:
- host: your.server.ip
- username: deploy
- privateKeyPath: /Users/yourname/.ssh/id_rsa
```

### Step-by-Step Deployment

#### First-Time Setup
```
1. Configure connection: configure with host: 159.65.152.60, username: root
2. Test connection: test-connection
3. Run first-time setup: first-setup with repo: git@github.com:yourusername/paramarsh-SMS.git
```

#### Regular Deployment
```
1. Pull latest code: git-pull
2. Install dependencies: install-deps
3. Build applications: build-all
4. Run migrations: db-migrate
5. Restart services: pm2-restart
6. Check health: health-check
```

#### Quick Deployment
```
quick-deploy  # Just pulls and restarts
```

#### Full Deployment
```
full-deploy  # Does everything automatically
```

### Common Operations

#### Check Status
```
pm2-status
check-ports
health-check
```

#### View Logs
```
pm2-logs with service: api, lines: 100
tail-logs with service: web, type: error
```

#### Database Operations
```
db-migrate  # Run migrations
db-seed     # Seed database
db-reset with confirm: true  # Reset database
```

#### Process Management
```
pm2-restart with service: api  # Restart API only
pm2-stop with service: all     # Stop everything
pm2-start                      # Start all services
```

## Available MCP Tools

### Configuration & Setup
| Tool | Description | Parameters |
|------|-------------|------------|
| `configure` | Set up server connection | host, username, privateKeyPath/password, projectPath, apiPort, webPort |
| `test-connection` | Test SSH connection | - |
| `setup-directories` | Create necessary directories | - |
| `install-bun` | Install Bun runtime | - |
| `install-pm2` | Install PM2 globally | - |
| `clone-repo` | Clone GitHub repository | repo, force |
| `first-setup` | Complete first-time setup | repo |

### Code Management
| Tool | Description | Parameters |
|------|-------------|------------|
| `git-pull` | Pull latest code | - |
| `git-status` | Check git status | - |
| `git-checkout` | Checkout branch | branch |

### Dependencies & Build
| Tool | Description | Parameters |
|------|-------------|------------|
| `install-deps` | Install all dependencies | clean |
| `install-api-deps` | Install API dependencies | - |
| `install-web-deps` | Install Web dependencies | - |
| `build-api` | Build API application | - |
| `build-web` | Build Web application | - |
| `build-all` | Build both applications | - |

### Database Management
| Tool | Description | Parameters |
|------|-------------|------------|
| `db-generate` | Generate Prisma client | - |
| `db-migrate` | Run migrations | - |
| `db-seed` | Seed database | - |
| `db-reset` | Reset database (CAUTION!) | confirm |

### PM2 Process Management
| Tool | Description | Parameters |
|------|-------------|------------|
| `pm2-start` | Start processes | service (api/web/all) |
| `pm2-stop` | Stop processes | service (api/web/all) |
| `pm2-restart` | Restart processes | service (api/web/all) |
| `pm2-status` | Get process status | - |
| `pm2-logs` | View logs | service, lines |
| `pm2-save` | Save process list | - |
| `pm2-startup` | Generate startup script | - |

### Monitoring
| Tool | Description | Parameters |
|------|-------------|------------|
| `health-check` | Check service health | - |
| `check-ports` | Check port status | - |
| `tail-logs` | Tail application logs | service, type, lines |

### Combined Operations
| Tool | Description | Parameters |
|------|-------------|------------|
| `full-deploy` | Complete deployment | skipBuild, skipInstall, skipMigrate |
| `quick-deploy` | Pull and restart only | - |

## Environment Variables

Set these in `ecosystem.config.js` on your server:

### API
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: API port (10011 for production, 8080 for local development)

### Web
- `NEXT_PUBLIC_API_URL`: API URL (https://api.paramarsh-sms.theflywheel.in)
- `PORT`: Web port (10010 for production, 3000 for local development)

## Troubleshooting

### Connection Issues
```bash
# Test SSH connection
ssh deploy@your.server.ip

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
```

### PM2 Issues
```bash
# On server
pm2 list
pm2 logs
pm2 restart all
```

### Build Failures
```bash
# Clear cache and reinstall
cd ~/paramarsh-sms/apps/api
rm -rf node_modules bun.lockb
bun install
```

### Database Issues
```bash
cd ~/paramarsh-sms/apps/api
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

## Port Configuration

### Production (Remote Server)
- **Frontend**: Port 10010
- **Backend**: Port 10011
- Configured in `ecosystem.config.js` for PM2
- Nginx reverse proxy handles SSL and routes to these ports

### Local Development
- **Frontend**: Port 3000 (default Next.js)
- **Backend**: Port 8080 (configured in package.json)
- No changes needed for local development

## Security Notes

- Never commit sensitive data to Git
- Use SSH keys instead of passwords
- Keep your server firewall configured (only allow 22, 80, 443)
- Regularly update dependencies
- Use environment variables for secrets
- Enable fail2ban for SSH protection

## Support

For issues or questions, please check:
- PM2 logs: `pm2 logs`
- Application logs in `~/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -xe`