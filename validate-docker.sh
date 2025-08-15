#!/bin/bash

echo "🐳 Validating Docker Configuration..."

# Check if docker-compose.yml exists and is valid
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml found"
    
    # Check for basic docker-compose syntax (if docker-compose is available)
    if command -v docker-compose &> /dev/null; then
        if docker-compose config > /dev/null 2>&1; then
            echo "✅ docker-compose.yml syntax is valid"
        else
            echo "❌ docker-compose.yml has syntax errors"
            docker-compose config
            exit 1
        fi
    else
        echo "⚠️  docker-compose not installed, skipping syntax check"
    fi
else
    echo "❌ docker-compose.yml not found"
    exit 1
fi

# Check Dockerfiles
echo ""
echo "📋 Checking Dockerfiles..."

if [ -f "apps/api/Dockerfile" ]; then
    echo "✅ API Dockerfile found"
else
    echo "❌ API Dockerfile missing"
    exit 1
fi

if [ -f "apps/web/Dockerfile" ]; then
    echo "✅ Web Dockerfile found"
else
    echo "❌ Web Dockerfile missing"
    exit 1
fi

# Check .dockerignore files
echo ""
echo "🚫 Checking .dockerignore files..."

if [ -f "apps/api/.dockerignore" ]; then
    echo "✅ API .dockerignore found"
else
    echo "⚠️  API .dockerignore missing"
fi

if [ -f "apps/web/.dockerignore" ]; then
    echo "✅ Web .dockerignore found"
else
    echo "⚠️  Web .dockerignore missing"
fi

# Check environment files
echo ""
echo "🔐 Checking environment files..."

if [ -f ".env.production" ]; then
    echo "✅ Production environment file found"
else
    echo "⚠️  .env.production missing"
fi

# Check if required directories exist
echo ""
echo "📁 Checking directory structure..."

if [ -d "apps/api" ]; then
    echo "✅ API directory exists"
else
    echo "❌ API directory missing"
    exit 1
fi

if [ -d "apps/web" ]; then
    echo "✅ Web directory exists"
else
    echo "❌ Web directory missing"
    exit 1
fi

# Check for package.json files
if [ -f "apps/api/package.json" ]; then
    echo "✅ API package.json found"
else
    echo "❌ API package.json missing"
    exit 1
fi

if [ -f "apps/web/package.json" ]; then
    echo "✅ Web package.json found"
else
    echo "❌ Web package.json missing"
    exit 1
fi

echo ""
echo "🎉 Docker configuration validation completed successfully!"
echo ""
echo "📖 Next steps:"
echo "1. Start Docker daemon"
echo "2. Run: docker-compose up --build"
echo "3. Access the application at http://localhost:3000"
echo "4. API will be available at http://localhost:8080"