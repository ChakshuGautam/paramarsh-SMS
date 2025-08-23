#!/bin/bash

# Paramarsh SMS Server Setup Script
# Run this once on your server to set up the deployment environment

set -e

echo "🚀 Setting up Paramarsh SMS deployment environment..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /root/paramarsh-sms
mkdir -p /root/logs

# Install Bun if not already installed
if ! command -v bun &> /dev/null; then
    echo "📦 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Clone the repository (replace with your actual repo)
echo "📥 Cloning repository..."
cd /root/paramarsh-sms
if [ ! -d ".git" ]; then
    git clone git@github.com:yourusername/paramarsh-SMS.git .
else
    echo "Repository already exists, pulling latest..."
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/api && bun install
cd ../web && bun install

# Setup database
echo "🗄️ Setting up database..."
cd ../api
npx prisma generate
npx prisma migrate deploy

# Copy PM2 ecosystem config
echo "⚙️ Setting up PM2 configuration..."
cp /root/paramarsh-sms/mcp/paramarsh-deploy/ecosystem.config.js /root/paramarsh-sms/

# Start PM2 processes
echo "🚀 Starting PM2 processes..."
cd /root/paramarsh-sms
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your reverse proxy (nginx/caddy) to:"
echo "   - Proxy paramarsh-sms.theflywheel.in to localhost:10010"
echo "   - Proxy api.paramarsh-sms.theflywheel.in to localhost:10011"
echo "2. Set up SSL certificates (Let's Encrypt recommended)"
echo "3. Configure environment variables in ecosystem.config.js"
echo ""
echo "Useful commands:"
echo "  pm2 list              - View process status"
echo "  pm2 logs              - View logs"
echo "  pm2 restart all       - Restart all processes"
echo "  pm2 monit             - Monitor processes"