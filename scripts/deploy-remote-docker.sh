#!/bin/bash

# Deploy Paramarsh SMS with Docker on Remote Server
# Usage: ./scripts/deploy-remote-docker.sh [server_ip] [ssh_user]

set -e

SERVER_IP=${1:-"your-server-ip"}
SSH_USER=${2:-"root"}
PROJECT_NAME="paramarsh-sms"

echo "🚀 Deploying Paramarsh SMS to remote server: $SSH_USER@$SERVER_IP"

# Check if server IP is provided
if [ "$SERVER_IP" = "your-server-ip" ]; then
    echo "❌ Please provide server IP: ./scripts/deploy-remote-docker.sh <server_ip> [ssh_user]"
    exit 1
fi

echo "📦 Preparing deployment files..."

# Create temporary deployment directory
DEPLOY_DIR="/tmp/paramarsh-deploy-$(date +%s)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp docker-compose.production.yml $DEPLOY_DIR/docker-compose.yml
cp -r apps/api $DEPLOY_DIR/
cp -r init-scripts $DEPLOY_DIR/ 2>/dev/null || mkdir -p $DEPLOY_DIR/init-scripts
cp scripts/seed-remote.sh $DEPLOY_DIR/

# Create .env file for production
cat > $DEPLOY_DIR/.env << EOF
POSTGRES_DB=paramarsh_sms
POSTGRES_USER=paramarsh
POSTGRES_PASSWORD=paramarsh123
DATABASE_URL=postgresql://paramarsh:paramarsh123@postgres:5432/paramarsh_sms
NODE_ENV=production
PORT=8080
EOF

echo "📤 Uploading files to remote server..."

# Copy files to remote server
scp -r $DEPLOY_DIR $SSH_USER@$SERVER_IP:/tmp/

echo "🔧 Setting up Docker on remote server..."

# SSH and setup
ssh $SSH_USER@$SERVER_IP << EOF
    set -e
    
    echo "Installing Docker and Docker Compose..."
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create project directory
    sudo mkdir -p /opt/$PROJECT_NAME
    sudo cp -r $DEPLOY_DIR/* /opt/$PROJECT_NAME/
    cd /opt/$PROJECT_NAME
    
    echo "🐳 Starting services with Docker Compose..."
    
    # Start services
    sudo docker-compose up -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 15
    
    # Check if services are running
    sudo docker-compose ps
    
    echo "✅ Services started successfully!"
    echo "🔗 API will be available at: http://$SERVER_IP:8080"
    echo "🗄️ PostgreSQL is running on port 5432"
EOF

echo "🌱 Setting up database schema and seed data..."

# Setup database schema and seed data
ssh $SSH_USER@$SERVER_IP << 'EOF'
    cd /opt/paramarsh-sms
    
    # Wait for postgres to be fully ready
    echo "Waiting for PostgreSQL to be ready..."
    until sudo docker exec paramarsh-postgres pg_isready -U paramarsh -d paramarsh_sms; do
        echo "Waiting for postgres..."
        sleep 2
    done
    
    echo "✅ PostgreSQL is ready!"
    
    # Install Node.js in the API container and run migrations/seeding
    sudo docker exec paramarsh-api bash -c "
        cd /app
        npm install
        npx prisma generate
        npx prisma db push
        npm run seed
    " || echo "⚠️ Seed data setup may need manual intervention"
    
    echo "🎉 Deployment complete!"
    echo ""
    echo "🔗 API URL: http://$(curl -s ifconfig.me):8080"
    echo "🗄️ Database: postgresql://paramarsh:paramarsh123@$(curl -s ifconfig.me):5432/paramarsh_sms"
    echo ""
    echo "To check logs: sudo docker-compose logs -f"
    echo "To stop services: sudo docker-compose down"
EOF

# Cleanup
rm -rf $DEPLOY_DIR

echo "✅ Remote deployment complete!"
echo "Your Paramarsh SMS instance should now be running on the remote server."