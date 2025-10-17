# 🚀 RENDER DEPLOYMENT CHECKLIST - PRODUCTION READY

## ✅ **CRITICAL: Environment Variables for Render**

Copy these EXACTLY to your Render service → Environment tab:

```bash
NODE_ENV=production
JWT_SECRET=erp-system-production-jwt-secret-key-minimum-64-characters-long-super-secure-2024
DATABASE_URL=postgresql://your-neon-or-render-db-url
FRONTEND_URL=https://erp-system-rmum.onrender.com
CORS_ORIGIN=https://erp-system-rmum.onrender.com
PORT=10000
```

## 🔧 **Render Service Settings**

```
Environment: Node.js 18+
Build Command: npm run build
Start Command: npm start
Root Directory: (leave blank)
Auto-Deploy: Yes
```

## 🗄️ **Database Setup Steps**

### Step 1: Run Migration (CRITICAL)
```bash
curl -X POST https://erp-system-rmum.onrender.com/api/auth/migrate
```

### Step 2: Verify Database
```bash
curl https://erp-system-rmum.onrender.com/api/auth/debug
```

Expected response:
```json
{
  "database": "connected",
  "tablesExist": true,
  "userCount": 1,
  "hasJwtSecret": true
}
```

## 🔐 **Authentication Test**

### Step 1: Login with Default Admin
```bash
curl -X POST https://erp-system-rmum.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

Expected response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

### Step 2: Test Authenticated Route
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://erp-system-rmum.onrender.com/api/parties?isActive=true
```

## 🎯 **Deployment Sequence**

1. **Set Environment Variables** in Render
2. **Deploy Service** (automatic)
3. **Run Migration** (POST /api/auth/migrate)
4. **Test Login** (POST /api/auth/login)
5. **Test Protected Routes** (GET /api/parties)

## 🔍 **Troubleshooting Commands**

### Check Server Status
```bash
curl https://erp-system-rmum.onrender.com/health
```

### Check Database Connection
```bash
curl https://erp-system-rmum.onrender.com/api/auth/debug
```

### Check API Routes
```bash
curl https://erp-system-rmum.onrender.com/api/health
```

## 🎉 **Success Criteria**

- ✅ Health check returns 200
- ✅ Debug shows `tablesExist: true`
- ✅ Login returns JWT token
- ✅ Protected routes return data (not 401)

## 🚨 **If Issues Persist**

1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct
4. Re-run migration endpoint
5. Check JWT_SECRET is exactly 64+ characters

---

**Default Credentials:**
- Email: `admin@company.com`
- Password: `admin123`

**Change these immediately after first successful login!**