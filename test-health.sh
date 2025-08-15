#!/bin/bash

echo "🏥 Health Check - Paramarsh SMS School Management System"
echo "========================================================"

# Test API Health
echo "🔍 Testing API Health (Backend)..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/health 2>/dev/null || echo "000")

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API Health: OK (Status: $API_RESPONSE)"
    # Get detailed health info
    API_DETAILS=$(curl -s http://localhost:8080/api/v1/health 2>/dev/null)
    echo "   Details: $API_DETAILS"
else
    echo "❌ API Health: FAILED (Status: $API_RESPONSE)"
    if [ "$API_RESPONSE" = "000" ]; then
        echo "   Error: Could not connect to API server"
        echo "   Make sure the API is running on http://localhost:8080"
    fi
fi

echo ""

# Test Web Health
echo "🔍 Testing Web Frontend Health..."
WEB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$WEB_RESPONSE" = "200" ]; then
    echo "✅ Web Frontend: OK (Status: $WEB_RESPONSE)"
    # Check if it's actually serving HTML
    WEB_CONTENT=$(curl -s http://localhost:3000 2>/dev/null | head -n 5)
    if [[ $WEB_CONTENT == *"<html"* ]] || [[ $WEB_CONTENT == *"<!DOCTYPE"* ]]; then
        echo "   HTML Content: Detected"
    else
        echo "   Warning: No HTML content detected"
    fi
else
    echo "❌ Web Frontend: FAILED (Status: $WEB_RESPONSE)"
    if [ "$WEB_RESPONSE" = "000" ]; then
        echo "   Error: Could not connect to web server"
        echo "   Make sure the web app is running on http://localhost:3000"
    fi
fi

echo ""

# Test API Endpoints
echo "🔍 Testing API Endpoints..."
STUDENTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/students 2>/dev/null || echo "000")
TEACHERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/hr/teachers 2>/dev/null || echo "000")

if [ "$STUDENTS_RESPONSE" = "200" ]; then
    echo "✅ Students API: OK (Status: $STUDENTS_RESPONSE)"
else
    echo "❌ Students API: FAILED (Status: $STUDENTS_RESPONSE)"
fi

if [ "$TEACHERS_RESPONSE" = "200" ]; then
    echo "✅ Teachers API: OK (Status: $TEACHERS_RESPONSE)"
else
    echo "❌ Teachers API: FAILED (Status: $TEACHERS_RESPONSE)"
fi

echo ""

# Docker Status (if available)
echo "🐳 Docker Container Status..."
if command -v docker &> /dev/null; then
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(paramarsh-api|paramarsh-web)" > /dev/null 2>&1; then
        echo "Docker containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(Names|paramarsh-api|paramarsh-web)"
    else
        echo "No Paramarsh Docker containers running"
    fi
else
    echo "Docker not available for status check"
fi

echo ""
echo "📝 Summary:"
echo "=========="
if [ "$API_RESPONSE" = "200" ] && [ "$WEB_RESPONSE" = "200" ]; then
    echo "🎉 All systems operational!"
    echo "   • API Backend: http://localhost:8080"
    echo "   • Web Frontend: http://localhost:3000"
    echo "   • Admin Panel: http://localhost:3000/admin"
elif [ "$API_RESPONSE" = "200" ]; then
    echo "⚠️  API is running but Web frontend has issues"
    echo "   • Check web container logs: docker-compose logs web"
elif [ "$WEB_RESPONSE" = "200" ]; then
    echo "⚠️  Web is running but API backend has issues"  
    echo "   • Check API container logs: docker-compose logs api"
else
    echo "🚨 Both services are down"
    echo "   • Start with: docker-compose up -d"
    echo "   • Check logs: docker-compose logs"
fi