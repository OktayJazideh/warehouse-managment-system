# Warehouse Management System - Production Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git** (for cloning and updates)
- Minimum 4GB RAM
- Minimum 20GB disk space

### Before Deployment
1. Ensure Docker is installed and running
2. Clone or download the project files
3. Configure environment variables
4. Review security settings

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# Navigate to project directory
cd "path\to\warehouse-management-system"

# Run deployment script
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
# Navigate to project directory
cd /path/to/warehouse-management-system

# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

### Manual Deployment
```bash
# Configure environment variables
cp .env.example .env
# Edit .env file with your settings

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready (check logs)
docker-compose -f docker-compose.prod.yml logs -f

# Run database setup
docker-compose -f docker-compose.prod.yml exec backend npm run setup
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Database (REQUIRED)
DB_PASSWORD=YourSecurePassword123!

# JWT Secret (REQUIRED - minimum 32 characters)
JWT_SECRET=YourSuperSecretJWTKeyForProduction123456789

# Redis (OPTIONAL)
REDIS_PASSWORD=YourRedisPassword123!

# Domain (REQUIRED for production)
FRONTEND_URL=https://your-domain.com

# Admin Email (OPTIONAL)
ADMIN_EMAIL=admin@your-domain.com
```

### Security Checklist
- [ ] Change default JWT_SECRET
- [ ] Use strong DB_PASSWORD
- [ ] Configure FRONTEND_URL with your domain
- [ ] Change default admin password after first login
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

## 🏗️ Architecture

### Services
1. **Frontend** (Nginx + Vue.js) - Port 80/443
2. **Backend** (Node.js API) - Port 3000
3. **Database** (PostgreSQL) - Port 5432
4. **Redis** (Caching) - Port 6379

### Data Persistence
- Database data: `postgres_data` volume
- Uploaded files: `uploads_data` volume
- Redis data: `redis_data` volume

## 🔧 Management Commands

### Service Control
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### Database Management
```bash
# Access database shell
docker-compose -f docker-compose.prod.yml exec database psql -U warehouse_user -d warehouse_production

# Create database backup
docker-compose -f docker-compose.prod.yml exec database pg_dump -U warehouse_user warehouse_production > backup.sql

# Restore database backup
docker-compose -f docker-compose.prod.yml exec -T database psql -U warehouse_user -d warehouse_production < backup.sql

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

### Application Management
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# Execute commands in backend container
docker-compose -f docker-compose.prod.yml exec backend npm run setup
```

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)
1. Install Certbot on your server
2. Obtain SSL certificates
3. Configure Nginx proxy (see nginx profile in docker-compose)
4. Update FRONTEND_URL to https://

### Using Custom Certificates
1. Place certificates in `./nginx/ssl/`
2. Update nginx configuration
3. Enable nginx proxy profile

## 📊 Monitoring & Logging

### Health Checks
- Frontend: `http://your-domain/health`
- Backend: `http://your-domain:3000/api/auth/health`
- Database: Built-in PostgreSQL health checks

### Log Locations
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs database

# System logs (if needed)
docker logs warehouse_api
docker logs warehouse_frontend
docker logs warehouse_db
```

### Performance Monitoring
Consider integrating:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for log analysis

## 🔄 Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T database pg_dump -U warehouse_user warehouse_production > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
docker run --rm -v warehouse-management-system_uploads_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/files_backup_$DATE.tar.gz -C /data .

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Restore Process
```bash
# Restore database
docker-compose -f docker-compose.prod.yml exec -T database psql -U warehouse_user -d warehouse_production < db_backup_YYYYMMDD_HHMMSS.sql

# Restore files
docker run --rm -v warehouse-management-system_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/files_backup_YYYYMMDD_HHMMSS.tar.gz -C /data
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if database is running
docker-compose -f docker-compose.prod.yml ps database

# Check database logs
docker-compose -f docker-compose.prod.yml logs database

# Test database connection
docker-compose -f docker-compose.prod.yml exec database pg_isready -U warehouse_user
```

**Backend API Not Responding**
```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Check if backend is running
curl -f http://localhost:3000/api/auth/health

# Restart backend service
docker-compose -f docker-compose.prod.yml restart backend
```

**Frontend Not Loading**
```bash
# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec frontend nginx -t

# Restart frontend service
docker-compose -f docker-compose.prod.yml restart frontend
```

### Performance Optimization

**Database Performance**
- Monitor query performance
- Add appropriate indexes
- Configure PostgreSQL settings
- Regular VACUUM and ANALYZE

**Application Performance**
- Enable Redis caching
- Optimize image sizes
- Use CDN for static assets
- Monitor memory usage

## 🔒 Security Considerations

### Network Security
- Use reverse proxy with SSL
- Configure firewall rules
- Limit database access
- Use private Docker networks

### Application Security
- Regular security updates
- Strong authentication
- Input validation
- Rate limiting
- Audit logging

### Data Security
- Regular backups
- Encrypted data at rest
- Secure data transmission
- Access control

## 📞 Support

### Documentation
- API Documentation: `http://your-domain:3000/api-docs`
- User Manual: See `docs/` directory
- Change Log: See `CHANGELOG.md`

### Getting Help
1. Check this deployment guide
2. Review application logs
3. Check GitHub issues
4. Contact system administrator

## 🔄 Updates & Maintenance

### Regular Maintenance
- Weekly: Check logs and performance
- Monthly: Update Docker images
- Quarterly: Security audit
- Annually: Infrastructure review

### Update Process
```bash
# 1. Backup current system
./backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Update services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# 5. Verify deployment
curl -f http://localhost/health
curl -f http://localhost:3000/api/auth/health
```

---

## 🎉 Congratulations!

Your Warehouse Management System is now ready for production use!

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Please change the admin password immediately after first login!

**Next Steps:**
1. Change default admin password
2. Configure SSL certificates
3. Set up monitoring
4. Create backup strategy
5. Train users on the system

For technical support, please refer to the documentation or contact your system administrator.