# ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with React and Node.js.

## Features

- **User Management** - Admin, Manager, Accountant, and Production roles
- **Inventory Management** - Track stock, materials, and supplies  
- **Order Management** - Process customer orders and deliveries
- **Accounting** - Financial tracking and reporting
- **Process Management** - Production workflows and quality control
- **Audit System** - Compliance tracking and reporting
- **Messaging** - Internal communication system
- **Dashboard** - Real-time analytics and insights

## Tech Stack

- **Frontend**: React, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcrypt

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm

### 1. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3001
```

### 2. Setup Database

Create a PostgreSQL database and seed it with sample data:
```bash
node scripts/seed.js
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm start
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

### Test User Accounts

After seeding the database, you can login with:
- Admin: `admin@company.com` / `admin123`
- Manager: `manager@erpsystem.com` / `manager123`
- Accountant: `accountant@erpsystem.com` / `accountant123`
- Production: `production@erpsystem.com` / `production123`

## License

MIT License
