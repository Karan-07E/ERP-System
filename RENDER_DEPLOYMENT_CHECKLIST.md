# 🚀 Render Deployment Checklist for ERP System

## ✅ Pre-Deployment Checklist

### 1. Repository Setup
- [ ] Code is pushed to GitHub repository
- [ ] Repository is public or Render has access
- [ ] `package.json` has correct scripts (build, start)

### 2. Database Setup
- [ ] PostgreSQL database created on Render
- [ ] Database URL copied to environment variables
- [ ] SSL settings configured correctly

### 3. Environment Variables
Copy these to your Render service environment variables:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:port/database_name
FRONTEND_URL=https://your-frontend-app.onrender.com
CORS_ORIGIN=https://your-frontend-app.onrender.com
JWT_SECRET=your-super-strong-jwt-secret-key-for-production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
MAX_FILE_SIZE=10485760
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

## 🔧 Render Service Configuration

### Backend Service Settings
- **Environment**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`
- **Plan**: Starter (minimum)
- **Auto-Deploy**: Yes

### Frontend Service Settings (if separate)
- **Environment**: Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Root Directory**: `frontend`

## 🚀 Deployment Steps

### Step 1: Create Backend Service
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure service settings:
   - Name: `erp-backend` (or your choice)
   - Environment: Node.js
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Step 2: Create Database
1. In Render Dashboard, click "New" → "PostgreSQL"
2. Choose a plan (Free tier available)
3. Copy the "External Database URL"
4. Add to backend service environment variables as `DATABASE_URL`

### Step 3: Configure Environment Variables
1. Go to backend service → Environment
2. Add all variables from the checklist above
3. Deploy the service

### Step 4: Test Deployment
Run the verification script:
```bash
# Local testing
node backend/scripts/verify-routes.js

# Or test manually
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/health
```

## 🔍 Verification Steps

### 1. Health Checks
```bash
# Basic server test
curl https://your-backend.onrender.com/test

# Health check
curl https://your-backend.onrender.com/health

# API health check
curl https://your-backend.onrender.com/api/health
```

### 2. Database Connection Test
```javascript
// Expected response from /health endpoint
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "environment": "production",
  "database": "connected",
  "port": 10000,
  "frontend_url": "https://your-frontend.onrender.com"
}
```

### 3. API Routes Test
```bash
# Dashboard safe initial data (no auth required)
curl https://your-backend.onrender.com/api/dashboard/safe-initial

# Should return empty arrays but confirm API is working
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Route not found" Error
- ✅ **Fixed**: Updated server.js with proper route mounting
- ✅ **Fixed**: Enhanced 404 handler for better debugging

#### 2. Database Connection Issues
- ✅ **Fixed**: Enhanced SSL configuration for Render
- ✅ **Fixed**: Improved connection pool settings
- Check: DATABASE_URL format is correct
- Check: Render database is running

#### 3. CORS Issues
- ✅ **Fixed**: Improved CORS configuration
- Check: FRONTEND_URL is correctly set
- Check: Both services are using HTTPS

#### 4. Environment Variables
- Check: All required variables are set in Render
- Check: No typos in variable names
- Check: JWT_SECRET is sufficiently long and strong

### Debugging Commands
```bash
# Check Render logs
# Go to Render Dashboard → Your Service → Logs

# Test specific routes
curl -v https://your-backend.onrender.com/api/health

# Check database connection
curl https://your-backend.onrender.com/health | jq .database
```

## 📊 Monitoring

### Key Metrics to Watch
- [ ] Response time < 2 seconds
- [ ] Database connection stable
- [ ] No 5xx errors in logs
- [ ] Memory usage within limits

### Render Dashboard Monitoring
- Check service status (green = healthy)
- Monitor deployment logs
- Watch metrics for unusual spikes

## 🎯 Success Criteria

### ✅ Deployment is successful when:
- [ ] All health checks return 200 OK
- [ ] Database shows "connected" status
- [ ] API routes respond correctly
- [ ] No errors in Render logs
- [ ] Frontend can connect to backend

### 🚀 Ready for Production when:
- [ ] All tests pass
- [ ] Performance is acceptable
- [ ] Security headers are configured
- [ ] Monitoring is set up
- [ ] Backup strategy is in place

---

## 📞 Support

If you encounter issues:
1. Check Render service logs first
2. Run the verification script
3. Review environment variables
4. Check database connectivity
5. Verify CORS settings

**Remember**: Render free tier services may sleep after 15 minutes of inactivity. First request after sleep may be slower.