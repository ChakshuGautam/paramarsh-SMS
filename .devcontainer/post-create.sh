#!/bin/bash

echo "🚀 Running post-create setup for Paramarsh SMS..."

# Install Bun
echo "📦 Installing Bun..."
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc

# Start PostgreSQL
sudo service postgresql start

# Wait for PostgreSQL to be ready
sleep 3

# Create database if it doesn't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'paramarsh_sms'" | grep -q 1 || \
    sudo -u postgres createdb -O paramarsh paramarsh_sms

echo "📦 Installing dependencies..."

# Install root dependencies
if [ -f "package.json" ]; then
    echo "Installing root dependencies..."
    pnpm install || npm install
fi

# Install apps/api dependencies
if [ -f "apps/api/package.json" ]; then
    echo "Installing backend dependencies..."
    cd apps/api
    pnpm install || npm install
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    echo "Running database migrations..."
    npx prisma migrate deploy || true
    
    cd ../..
fi

# Install apps/web dependencies
if [ -f "apps/web/package.json" ]; then
    echo "Installing frontend dependencies..."
    cd apps/web
    pnpm install || npm install
    
    # Install Playwright browsers
    echo "Installing Playwright browsers..."
    npx playwright install chromium || true
    
    cd ../..
fi

# Initialize firewall (optional, can be enabled for security)
# echo "🔒 Initializing firewall..."
# sudo /home/node/init-firewall.sh

# Create .env files if they don't exist
if [ ! -f "apps/api/.env" ] && [ -f "apps/api/.env.example" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "Created apps/api/.env from example"
fi

if [ ! -f "apps/web/.env.local" ] && [ -f "apps/web/.env.example" ]; then
    cp apps/web/.env.example apps/web/.env.local
    echo "Created apps/web/.env.local from example"
fi

# Set proper permissions
sudo chown -R node:node /workspace

echo ""
echo "✅ Post-create setup completed!"
echo ""
echo "📝 Quick start commands:"
echo "  Backend:  cd apps/api && pnpm run start:dev"
echo "  Frontend: cd apps/web && pnpm run dev"
echo "  Database: sudo service postgresql status"
echo ""
echo "🔧 Useful aliases:"
echo "  nr = npm run"
echo "  pr = pnpm run"
echo "  br = bun run"
echo "  gs = git status"
echo ""