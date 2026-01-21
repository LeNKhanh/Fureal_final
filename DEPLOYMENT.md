# 🚀 Deployment Guide - Fureal E-commerce API

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker
- Docker Compose

#### Steps

1. **Clone/Navigate to project directory**
```bash
cd d:\Fureal_OUTsource\Fureal
```

2. **Configure environment variables**
```bash
# Copy example env
cp .env.example .env

# Edit .env with production values
# IMPORTANT: Change JWT_SECRET and API_KEY!
```

3. **Build and start services**
```bash
docker-compose up -d
```

4. **Verify deployment**
```bash
# Check logs
docker-compose logs -f api

# Test API
curl http://localhost:3000/api/products
```

5. **Access application**
- API: http://localhost:3000/api
- Docs: http://localhost:3000/api/docs

---

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 20+
- PostgreSQL 17+
- PM2 (for process management)

#### Steps

1. **Install dependencies**
```bash
npm ci --production
```

2. **Build application**
```bash
npm run build
```

3. **Configure environment**
```bash
# Set production environment variables
export NODE_ENV=production
export PORT=3000
export DATABASE_HOST=your-db-host
export DATABASE_USERNAME=your-db-user
export DATABASE_PASSWORD=your-db-password
export JWT_SECRET=your-strong-secret
export API_KEY=your-api-key
```

4. **Start with PM2**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name fureal-api

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

5. **Monitor application**
```bash
pm2 status
pm2 logs fureal-api
pm2 monit
```

---

### Option 3: Cloud Deployment

#### Heroku

1. **Create Heroku app**
```bash
heroku create fureal-api
```

2. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set API_KEY=your-api-key
```

4. **Deploy**
```bash
git push heroku main
```

#### AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04)

2. **Install dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

3. **Setup application**
```bash
# Clone or upload code
git clone your-repo.git
cd fureal-api

# Install dependencies
npm ci --production

# Build
npm run build

# Configure environment
sudo nano .env
```

4. **Start application**
```bash
pm2 start dist/main.js --name fureal-api
pm2 startup
pm2 save
```

5. **Setup Nginx reverse proxy**
```bash
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/fureal-api
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fureal-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### DigitalOcean App Platform

1. **Create new app**
2. **Connect GitHub repository**
3. **Configure build command**: `npm run build`
4. **Configure run command**: `node dist/main`
5. **Add environment variables**
6. **Deploy**

---

## Production Checklist

### Security
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Change `API_KEY` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domains
- [ ] Review and limit exposed endpoints
- [ ] Set up rate limiting
- [ ] Enable security headers

### Database
- [ ] Use production database credentials
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set `synchronize: false` (already set)
- [ ] Run database migrations if needed
- [ ] Set up monitoring

### Application
- [ ] Configure logging (file rotation)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure monitoring (New Relic, DataDog)
- [ ] Set up health checks
- [ ] Configure graceful shutdown
- [ ] Set resource limits

### Performance
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure caching
- [ ] Optimize database queries
- [ ] Set up load balancing (if needed)

---

## Environment Variables for Production

```env
# REQUIRED - Change these!
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-random-string>
API_KEY=<generate-strong-random-string>

# Database
DATABASE_HOST=<your-production-db-host>
DATABASE_PORT=5432
DATABASE_USERNAME=<db-user>
DATABASE_PASSWORD=<strong-db-password>
DATABASE_NAME=fureal_ecommerce

# Optional
JWT_EXPIRES_IN=7d
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
CORS_ORIGIN=https://your-frontend.com
```

---

## Monitoring & Maintenance

### Health Check Endpoint
```bash
curl http://your-domain.com/api/products
```

### View Logs
```bash
# Docker
docker-compose logs -f api

# PM2
pm2 logs fureal-api

# System logs
journalctl -u fureal-api -f
```

### Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres fureal_ecommerce > backup.sql

# Restore
psql -h localhost -U postgres fureal_ecommerce < backup.sql
```

### Update Application
```bash
# Docker
docker-compose pull
docker-compose up -d

# PM2
git pull
npm ci --production
npm run build
pm2 restart fureal-api
```

---

## Troubleshooting

### Application won't start
1. Check logs: `pm2 logs fureal-api` or `docker-compose logs api`
2. Verify database connection
3. Check environment variables
4. Ensure port is not in use

### Database connection error
1. Verify PostgreSQL is running
2. Check credentials in .env
3. Test connection: `psql -h HOST -U USER -d DATABASE`
4. Check firewall rules

### 502 Bad Gateway (Nginx)
1. Check if application is running
2. Verify proxy_pass URL
3. Check application logs
4. Restart Nginx: `sudo systemctl restart nginx`

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple instances
- Share session state (Redis)
- Use managed database (AWS RDS, DigitalOcean Managed DB)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database indexes
- Enable caching

---

## Support & Maintenance

### Regular Tasks
- Monitor application logs
- Review error rates
- Check database performance
- Update dependencies
- Backup database
- Review security advisories

### Emergency Contacts
- Database admin: [contact]
- DevOps team: [contact]
- On-call engineer: [contact]

---

## Deployment Complete! 🎉

Your Fureal E-commerce API is now deployed and ready for production use!

**Next steps:**
1. Test all endpoints
2. Monitor application performance
3. Set up automated backups
4. Configure monitoring alerts
5. Plan for scaling

**Good luck with your deployment! 🚀**
