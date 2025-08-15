# Docker Deployment Guide

This guide explains how to deploy the Paramarsh SMS (School Management System) using Docker Compose.

## Prerequisites

- Docker Engine 20.0 or higher
- Docker Compose 2.0 or higher
- At least 2GB RAM available
- 10GB free disk space

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd paramarsh-SMS
   ```

2. **Build and start the services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the applications**:
   - **Web Application**: http://localhost:3000
   - **API Documentation**: http://localhost:8080/api/v1 (if Swagger is enabled)
   - **API Health Check**: http://localhost:8080/api/v1/health

## Services Overview

### 🚀 API Service (NestJS)
- **Container**: `paramarsh-api`
- **Port**: 8080
- **Features**:
  - Automatic database migrations
  - Database seeding with sample data
  - Health checks
  - SQLite persistence via Docker volumes

### 🌐 Web Service (Next.js)
- **Container**: `paramarsh-web`
- **Port**: 3000
- **Features**:
  - Production-optimized build
  - Health checks
  - Connects to API service automatically

### 💾 Database (SQLite)
- **Type**: SQLite database file
- **Persistence**: Docker volume `sqlite_data`
- **Location**: `/app/data/dev.db` (inside API container)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
NODE_ENV=production
PORT=8080
DATABASE_URL=file:/app/data/dev.db

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# CORS (adjust for production)
CORS_ORIGIN=http://localhost:3000
```

### Production Deployment

For production deployment:

1. **Update environment variables**:
   ```bash
   cp .env.production .env
   # Edit .env with your production settings
   ```

2. **Update CORS origins** in `.env`:
   ```bash
   CORS_ORIGIN=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```

3. **Use production ports** in `docker-compose.yml`:
   ```yaml
   ports:
     - "80:3000"   # Web app
     - "8080:8080" # API
   ```

## Management Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with build
docker-compose up --build

# Start specific service
docker-compose up api
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes the database!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs web

# Follow logs
docker-compose logs -f api
```

### Database Management

#### Backup Database
```bash
# Create backup
docker-compose exec api cp /app/data/dev.db /app/data/backup-$(date +%Y%m%d).db

# Copy backup to host
docker cp paramarsh-api:/app/data/backup-$(date +%Y%m%d).db ./backup.db
```

#### Restore Database
```bash
# Copy backup to container
docker cp ./backup.db paramarsh-api:/app/data/dev.db

# Restart API service
docker-compose restart api
```

#### Reset Database
```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm paramarsh-sms_sqlite_data

# Start services (will recreate and seed database)
docker-compose up
```

### Access Container Shell
```bash
# API container
docker-compose exec api sh

# Web container
docker-compose exec web sh
```

## Health Monitoring

Both services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect paramarsh-api --format='{{.State.Health.Status}}'
docker inspect paramarsh-web --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Service Won't Start
1. Check logs: `docker-compose logs <service-name>`
2. Verify ports aren't in use: `netstat -tlnp | grep :3000`
3. Check disk space: `df -h`

### Database Issues
1. Check API logs: `docker-compose logs api`
2. Verify volume mount: `docker volume inspect paramarsh-sms_sqlite_data`
3. Reset database if corrupted (see Database Management)

### Build Issues
1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check .dockerignore files

### Memory Issues
1. Increase Docker memory limit (Docker Desktop)
2. Monitor usage: `docker stats`
3. Use `docker-compose down` instead of force-stopping

## Security Considerations

### Production Security
1. **Use HTTPS**: Configure reverse proxy (nginx/Apache)
2. **Environment variables**: Never commit sensitive data
3. **Network isolation**: Use Docker networks
4. **User permissions**: Containers run as non-root users
5. **Regular updates**: Keep Docker images updated

### Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 8080/tcp  # Don't expose API directly
```

## Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
  web:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.3'
```

### Volume Performance
For better SQLite performance on production:
```yaml
volumes:
  sqlite_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/paramarsh/data
```

## Backup Strategy

### Automated Backups
Create a cron job for regular backups:
```bash
#!/bin/bash
# /etc/cron.daily/paramarsh-backup
BACKUP_DIR="/backups/paramarsh"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
docker-compose exec -T api cat /app/data/dev.db > $BACKUP_DIR/db_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.db" -mtime +30 -delete
```

## Support

For issues and questions:
1. Check logs first: `docker-compose logs`
2. Review this documentation
3. Create an issue in the repository
4. Include logs and configuration when reporting issues

---

## Quick Reference

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Backup database
docker cp paramarsh-api:/app/data/dev.db ./backup.db

# Reset everything
docker-compose down -v && docker-compose up --build
```