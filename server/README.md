# UrjaSync Backend

Smart Energy Management Backend API built with Node.js, Express & MongoDB.

## Features

### Phase 1 - Authentication & User Management ✅
- JWT-based authentication (access & refresh tokens)
- User registration/login/logout
- Profile management
- Settings & notification preferences

### Phase 2 - Device Management ✅
- CRUD operations for devices
- Real-time device control (on/off, intensity)
- Room-based filtering
- Device statistics

### Phase 3 - Energy Data & Analytics ✅
- Real-time energy usage
- Historical data (today, weekly, monthly)
- Cost analysis
- Device breakdown analytics
- Carbon emissions tracking

### Phase 4 - Billing & Sustainability ✅
- Monthly bill tracking
- Budget management with alerts
- Savings calculations
- Sustainability goals
- Environmental impact stats

### Phase 5 - Real-time Communication ✅
- WebSocket with JWT authentication
- Real-time energy updates
- Device status broadcasts
- Alert notifications

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev

# Or start production server
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urjasync
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

## API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/register` | `{email, password, fullName}` | Create account |
| POST | `/login` | `{email, password}` | Login |
| POST | `/logout` | `{refreshToken}` | Logout |
| GET | `/me` | - | Get current user |
| POST | `/refresh-token` | `{refreshToken}` | Get new access token |

### User Routes (`/api/user`) - Protected

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/settings` | - | Get user settings |
| PUT | `/settings` | `{monthlyBudget, alertThreshold}` | Update settings |
| PUT | `/profile` | `{fullName, email}` | Update profile |
| PUT | `/notifications` | `{energyAlerts, costWarnings...}` | Update notifications |

### Device Routes (`/api/devices`) - Protected

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/` | Query: `?room=&status=` | List devices |
| POST | `/` | `{name, room, type, powerRating}` | Add device |
| GET | `/:id` | - | Get device details |
| PUT | `/:id` | `{name, room, type...}` | Update device |
| DELETE | `/:id` | - | Delete device |
| POST | `/:id/toggle` | `{status: true/false}` | Turn on/off |
| POST | `/:id/intensity` | `{intensity: 0-100}` | Set intensity |
| GET | `/rooms` | - | Get unique rooms |
| GET | `/:id/stats` | Query: `?days=7` | Device statistics |

### Energy Routes (`/api/energy`) - Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/realtime` | Current usage & active devices |
| GET | `/today` | Today's hourly data |
| GET | `/weekly` | Last 7 days data |
| GET | `/monthly` | Monthly aggregated data |
| GET | `/range?from=&to=&deviceId=` | Custom date range |
| POST | `/reading` | Add new reading (simulation) |

### Analytics Routes (`/api/analytics`) - Protected

| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| GET | `/usage-trend` | `?days=7` | Usage trends |
| GET | `/cost-analysis` | - | Hourly cost data |
| GET | `/device-breakdown` | - | Usage % by device |
| GET | `/carbon-trend` | - | Monthly emissions |
| GET | `/dashboard-stats` | - | All dashboard stats |

### Billing Routes (`/api/billing`) - Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/current` | Current month bill + budget status |
| GET | `/history` | Query: `?limit=12` | Past bills |
| GET | `/budget-status` | Budget tracker with alerts |
| GET | `/savings` | Monthly savings comparison |
| POST | `/generate` | `{month, year}` | Generate bill |

### Sustainability Routes (`/api/sustainability`) - Protected

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/stats` | - | Carbon, trees, water stats |
| GET | `/goals` | - | User sustainability goals |
| PUT | `/goals/:goalId` | `{current}` | Update goal progress |
| GET | `/emissions` | `?months=6` | Emission history |
| POST | `/init` | - | Initialize goals |

## WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `device:control` | `{deviceId, action, value}` | Control device |
| `energy:subscribe` | - | Subscribe to updates |
| `energy:unsubscribe` | - | Unsubscribe |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `energy:update` | `{usage, cost, timestamp}` | Real-time energy |
| `device:status` | `{deviceId, status, intensity}` | Device changes |
| `alert` | `{type, message}` | Notifications |
| `error` | `{message}` | Error messages |

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── socket/         # WebSocket handlers
│   ├── utils/          # Helpers & seeders
│   └── validators/     # Zod schemas
├── server.js           # Entry point
├── seed.js             # Database seeder
└── package.json
```

## Demo Credentials

After running `npm run seed`:
- Email: `demo@urjasync.com`
- Password: `demo123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm run seed` | Seed demo data |

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "count": 10
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

- JWT authentication with refresh tokens
- Password hashing (bcrypt, 12 rounds)
- Rate limiting (100 req/15min, 10 auth/15min)
- Helmet security headers
- CORS protection
- Input validation (Zod)
- MongoDB injection protection

## License

MIT
