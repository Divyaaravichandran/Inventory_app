# Kongu Hi-Tech Rice Industries - Inventory & Operations Management System

A comprehensive MERN stack application for managing rice industry operations including procurement, production, sales, and finance.

## Features

- **Role-Based Access**: Admin and Dealer roles with separate dashboards
- **Dashboard**: Real-time KPIs, charts, and reports
- **Procurement**: Paddy inward management with quality tracking
- **Production**: Rice stock management with bag tracking
- **Sales**: Order entry and dispatch tracking
- **Finance**: Payment management and customer ledger
- **Dealer Management**: Complete dealer portal with order placement and invoice tracking
- **Godown Management**: Storage capacity tracking and alerts
- **Alerts & Notifications**: Low stock warnings, payment alerts, capacity alerts

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose
- **Authentication**: JWT-based authentication
- **Database**: MongoDB Atlas (Cloud) or Local MongoDB

## Project Structure

```
InventoryApp/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── .env            # Environment variables (create from .env.example)
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   └── assets/      # Images and assets
│   └── public/
├── README.md
├── QUICK_START.md
└── MONGODB_ATLAS_SETUP.md
```

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (recommended) or Local MongoDB

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure MongoDB Atlas:
   - Follow the detailed guide in `MONGODB_ATLAS_SETUP.md`
   - Or use local MongoDB: `mongodb://localhost:27017/kongu_rice_industries`
   - Update `MONGODB_URI` in `.env` file

5. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kongu_rice_industries?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

6. Start the backend server:
```bash
npm run dev
# or
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

1. **Role Selection**: Start at the welcome screen and select "Admin" or "Dealer" role
2. **Admin Sign Up/Login**: Create an admin account or login with existing credentials
3. **Dealer Setup**: Admin creates dealers, dealers set up password using Dealer ID
4. **Dashboard**: View KPIs, charts, and recent activity
5. **Paddy Inward**: Add new paddy procurement entries
6. **Godown Management**: Manage storage facilities
7. **Rice Stock**: Track rice inventory and bag stocks
8. **Sales**: Record new sales and track orders
9. **Dealer Orders**: Manage dealer orders (approve/reject)
10. **Dispatch**: Track vehicle dispatch and delivery status
11. **Payments**: Manage customer payments and dealer invoices
12. **Settings**: Update admin profile

## MongoDB Atlas Migration

This project is configured for **MongoDB Atlas** (cloud database). 

📖 **See `MONGODB_ATLAS_SETUP.md` for complete migration guide**

Quick steps:
1. Create MongoDB Atlas account (free tier available)
2. Create cluster and database user
3. Whitelist your IP address
4. Copy connection string to `.env` file
5. Start the server - it will connect automatically!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login admin
- `POST /api/dealer-auth/register` - Dealer password setup
- `POST /api/dealer-auth/login` - Dealer login
- `GET /api/auth/me` - Get current user

### Paddy
- `GET /api/paddy` - Get all paddy records
- `POST /api/paddy` - Add paddy inward
- `GET /api/paddy/stock` - Get stock summary

### Rice
- `GET /api/rice` - Get all rice stock
- `POST /api/rice` - Add rice stock
- `GET /api/rice/stock` - Get stock summary

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale status
- `GET /api/sales/recent` - Get recent sales

### Dealers
- `GET /api/dealers` - Get all dealers
- `POST /api/dealers` - Create dealer
- `PUT /api/dealers/:id` - Update dealer
- `GET /api/dealers/:id/overview` - Get dealer overview

### Dealer Orders
- `GET /api/dealer-orders` - Get all orders (admin)
- `GET /api/dealer-orders/dealer` - Get dealer's orders
- `POST /api/dealer-orders/dealer` - Place order (dealer)
- `POST /api/dealer-orders/:id/approve` - Approve order (admin)
- `POST /api/dealer-orders/:id/status` - Update order status

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `GET /api/payments/summary` - Get payment summary
- `GET /api/payments/ledger` - Get customer ledger

### Invoices
- `GET /api/invoices` - Get all invoices (admin)
- `GET /api/invoices/dealer` - Get dealer invoices
- `POST /api/invoices` - Create invoice (admin)

### Godown
- `GET /api/godown` - Get all godowns
- `POST /api/godown` - Create godown
- `PUT /api/godown/:id` - Update godown

### Reports
- `GET /api/reports/dashboard` - Get dashboard data
- `GET /api/reports/charts` - Get chart data

### Admin
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update profile
- `GET /api/admin/alerts` - Get alerts

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## Troubleshooting

### MongoDB Connection Issues
- **Atlas**: Verify connection string, IP whitelist, and credentials
- **Local**: Ensure MongoDB service is running
- Check `.env` file has correct `MONGODB_URI`

### Port Already in Use
- Backend: Change PORT in `.env` file
- Frontend: Use `PORT=3001 npm start`

### CORS Errors
- Ensure backend is running on port 5000
- Check frontend API calls use correct URL

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET in backend `.env`
- Check user role matches route requirements

## Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Use strong JWT secrets in production
- Restrict MongoDB Atlas IP whitelist in production
- Use environment-specific configurations
- Enable MongoDB Atlas encryption at rest

## License

This project is proprietary software for Kongu Hi-Tech Rice Industries.

## Support

For MongoDB Atlas setup, see `MONGODB_ATLAS_SETUP.md`
For quick start guide, see `QUICK_START.md`
