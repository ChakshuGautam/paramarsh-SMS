# Docker Remote Deployment Guide

Deploy Paramarsh SMS with PostgreSQL to any remote server using Docker.

## Quick Start

### 1. Deploy to Remote Server
```bash
# Deploy to your remote server
./scripts/deploy-remote-docker.sh YOUR_SERVER_IP root

# Example:
./scripts/deploy-remote-docker.sh 203.0.113.10 ubuntu
```

### 2. Manual Docker Setup (Alternative)
If you prefer manual setup:

```bash
# 1. Copy files to server
scp docker-compose.production.yml user@server:/opt/paramarsh-sms/docker-compose.yml

# 2. SSH to server and run
ssh user@server
cd /opt/paramarsh-sms
docker-compose up -d

# 3. Seed the database
docker exec -it paramarsh-api bash
npm run seed
```

## What Gets Deployed

### Services
- **PostgreSQL 15**: Database with persistent storage
- **API Server**: NestJS backend (optional)
- **Network**: Isolated Docker network

### Database Setup
- **Database**: `paramarsh_sms`
- **User**: `paramarsh`
- **Password**: `paramarsh123`
- **Port**: `5432`

### Seed Data
- **13 Branches**: Multi-tenant with composite IDs
- **6500+ Students**: Indian names and authentic data
- **Teachers & Staff**: Realistic data per branch
- **Fee Structures**: Complete billing setup
- **Sample Invoices**: Demo financial data

## Environment Variables

The deployment automatically creates:

```env
DATABASE_URL=postgresql://paramarsh:paramarsh123@postgres:5432/paramarsh_sms
NODE_ENV=production
PORT=8080
POSTGRES_DB=paramarsh_sms
POSTGRES_USER=paramarsh
POSTGRES_PASSWORD=paramarsh123
```

## Server Requirements

- **OS**: Ubuntu 20.04+ or similar Linux
- **RAM**: 2GB minimum, 4GB recommended  
- **Storage**: 10GB minimum for database
- **Docker**: Auto-installed by script
- **Ports**: 5432 (PostgreSQL), 8080 (API)

## Post-Deployment

### Check Status
```bash
ssh user@server
cd /opt/paramarsh-sms
docker-compose ps
docker-compose logs -f
```

### Database Connection
```bash
# External connection string
postgresql://paramarsh:paramarsh123@YOUR_SERVER_IP:5432/paramarsh_sms

# Test connection
psql -h YOUR_SERVER_IP -U paramarsh -d paramarsh_sms
```

### API Access
```bash
# Health check
curl http://YOUR_SERVER_IP:8080/api/v1/health

# Students endpoint
curl http://YOUR_SERVER_IP:8080/api/v1/students
```

## Troubleshooting

### Database Issues
```bash
# Check database logs
docker logs paramarsh-postgres

# Access database directly
docker exec -it paramarsh-postgres psql -U paramarsh -d paramarsh_sms
```

### API Issues
```bash
# Check API logs
docker logs paramarsh-api

# Restart services
docker-compose restart

# Rebuild API
docker-compose up --build -d
```

### Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw allow 5432/tcp
sudo ufw allow 8080/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=5432/tcp --permanent
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

## Security Notes

⚠️ **Production Security:**
- Change default passwords
- Use environment variables for secrets
- Set up SSL/TLS certificates
- Configure firewall rules
- Enable backup automation

## Backup & Recovery

### Create Backup
```bash
docker exec paramarsh-postgres pg_dump -U paramarsh paramarsh_sms > backup.sql
```

### Restore Backup
```bash
docker exec -i paramarsh-postgres psql -U paramarsh paramarsh_sms < backup.sql
```

## Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose up --build -d

# Run any new migrations
docker exec paramarsh-api npm run migrate
```