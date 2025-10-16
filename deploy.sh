#!/bin/bash

# Warehouse Management System Production Deployment Script
# Make sure Docker and Docker Compose are installed

set -e  # Exit on any error

echo "🚀 Starting Warehouse Management System Deployment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Pre-deployment checks..."

# Validate required environment variables
required_vars=("DB_PASSWORD" "JWT_SECRET" "FRONTEND_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "📊 Waiting for database..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose -f docker-compose.prod.yml exec -T database pg_isready -U warehouse_user -d warehouse_production >/dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database failed to start after $max_attempts attempts"
        docker-compose -f docker-compose.prod.yml logs database
        exit 1
    fi
    
    echo "⏳ Database attempt $attempt/$max_attempts..."
    sleep 5
    attempt=$((attempt + 1))
done

# Wait for backend to be ready
echo "🔧 Waiting for backend API..."
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/api/auth/health >/dev/null 2>&1; then
        echo "✅ Backend API is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Backend API failed to start after $max_attempts attempts"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi
    
    echo "⏳ Backend attempt $attempt/$max_attempts..."
    sleep 5
    attempt=$((attempt + 1))
done

# Wait for frontend to be ready
echo "🎨 Waiting for frontend..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo "✅ Frontend is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Frontend failed to start after $max_attempts attempts"
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi
    
    echo "⏳ Frontend attempt $attempt/$max_attempts..."
    sleep 5
    attempt=$((attempt + 1))
done

# Run database migrations and seed data
echo "📊 Running database setup..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run setup

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost/health"
echo ""

echo "👤 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  Please change the admin password immediately!"
echo ""

echo "📝 Next Steps:"
echo "   1. Change default admin password"
echo "   2. Update .env file with your domain and secure passwords"
echo "   3. Set up SSL certificates if deploying to production"
echo "   4. Configure backup strategy"
echo "   5. Set up monitoring and logging"
echo ""

echo "✅ Warehouse Management System is now running!"