# RideMates 🚗

**Your Daily Commute, Shared.**

RideMates is a full-stack carpooling web application that connects daily commuters travelling similar routes, allowing them to share rides, split travel costs, and reduce vehicles on the road. Built with the MERN stack as a portfolio-quality project.

---

## Features

### Passenger / Ride Seeker
- Register and log in securely
- Search rides by pickup, destination, date, and departure time
- Filter and sort results by cost, seats, date, or match score
- View driver profile, route, vehicle, and cost details
- Send a seat request with an optional message
- Cancel a pending request
- Track all sent requests and their statuses

### Driver / Ride Provider
- Create a ride listing with route, stops, schedule, vehicle, and cost
- Accept or reject incoming passenger requests
- Seats are adjusted automatically on acceptance / cancellation
- Edit or cancel an existing ride listing
- Dashboard overview of all rides and requests

### General
- JWT authentication with bcrypt password hashing
- Protected routes on both frontend and backend
- Dual role: a single account can be both a passenger and a driver
- Ride matching score (Great / Good / Partial / Low match) based on location text and time proximity
- Responsive design: desktop, tablet, mobile
- Loading states, empty states, and inline error messages
- Confirmation dialogs for destructive actions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| State | React Context API |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Maps | Leaflet / react-leaflet (OpenStreetMap, no API key needed) |
| Security | Helmet, express-rate-limit, express-validator |

---

## Project Structure

```
ridemates/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Spinner, Alert, Modal, Avatar, EmptyState, ConfirmDialog
│   │   │   ├── layout/       # Navbar, Footer, ProtectedRoute
│   │   │   └── rides/        # RideCard, SearchBar
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useAsync
│   │   ├── pages/            # All page components
│   │   ├── services/         # API service layer (axios)
│   │   ├── utils/            # formatters (date, time, currency)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                   # Express backend
│   ├── config/               # MongoDB connection
│   ├── controllers/          # authController, userController, rideController, requestController
│   ├── middleware/           # auth (JWT), errorHandler, validate
│   ├── models/               # User, Ride, RideRequest (Mongoose)
│   ├── routes/               # authRoutes, userRoutes, rideRoutes, requestRoutes
│   ├── utils/                # generateToken, matchRides
│   ├── .env.example
│   └── server.js
│
├── .gitignore
├── package.json              # Root — runs client + server concurrently
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm 9+

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ridemates
```

### 2. Configure the backend environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ridemates   # or your Atlas URI
JWT_SECRET=a_long_random_secret_string_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Never commit the `.env` file.** It is already in `.gitignore`.

### 3. Install all dependencies

```bash
# From the ridemates/ root
npm run install-all
```

Or install individually:

```bash
npm install                   # root (concurrently)
npm install --prefix client   # React frontend
npm install --prefix server   # Express backend
```

### 4. Start development servers

```bash
npm run dev
```

This starts both servers concurrently:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

The Vite dev server proxies `/api/*` requests to the Express backend, so CORS is handled automatically in development.

### 5. Production build

```bash
npm run build    # builds client/dist
```

Serve the `client/dist` folder with any static host (Vercel, Netlify, S3 + CloudFront), and deploy the `server/` as a Node.js service (Railway, Render, Fly.io, AWS EC2, etc.).

---

## API Reference

All endpoints return JSON with `{ success: boolean, message: string, ...data }`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Yes | Get own profile |
| PATCH | `/api/users/me` | Yes | Update own profile |

### Rides

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rides` | No | Search/list rides (query params below) |
| POST | `/api/rides` | Yes | Create a ride |
| GET | `/api/rides/user/my` | Yes | Get rides you created |
| GET | `/api/rides/:id` | No | Get a single ride |
| PATCH | `/api/rides/:id` | Yes (driver only) | Update a ride |
| DELETE | `/api/rides/:id` | Yes (driver only) | Cancel a ride |

**Ride search query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `origin` | string | Partial location text |
| `destination` | string | Partial location text |
| `date` | ISO date | Exact travel date |
| `time` | HH:MM | Preferred departure time |
| `seats` | number | Minimum available seats |
| `maxCost` | number | Max cost per passenger |
| `page` | number | Page number (default 1) |
| `limit` | number | Results per page (default 20) |

### Ride Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rides/:id/requests` | Yes | Send a seat request |
| GET | `/api/requests/sent` | Yes | Get requests you sent |
| GET | `/api/requests/received` | Yes | Get requests on your rides |
| PATCH | `/api/requests/:requestId` | Yes | Accept, reject, or cancel a request |

---

## Data Models

### User
`name · email · password (hashed) · phone · role (passenger/driver/both) · vehicle · bio · profilePhoto · isActive`

### Ride
`driver (ref) · origin · destination · stops[] · travelDate · departureTime · totalSeats · availableSeats · vehicle · estimatedTripCost · costPerPassenger · currency · notes · status (active/full/cancelled/completed)`

### RideRequest
`ride (ref) · passenger (ref) · seatsRequested · pickupLocation · message · status (pending/accepted/rejected/cancelled) · respondedAt`

---

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- JWTs expire after 7 days by default
- All private endpoints require `Authorization: Bearer <token>`
- Input is validated with `express-validator` on every mutation endpoint
- Authorization checks ensure users can only modify their own rides and profiles
- Accepting a request checks seat availability atomically
- Rate limiting: 100 requests / 15 minutes per IP
- `helmet` sets secure HTTP headers
- `.env` and `node_modules` are excluded from git

---

## Implemented Features

- [x] JWT authentication (register, login, logout, restore session)
- [x] Protected routes (frontend + backend)
- [x] Create, edit, cancel rides
- [x] Search and filter rides
- [x] Ride matching score (text + time proximity)
- [x] Request a seat / cancel request
- [x] Accept / reject passenger requests with automatic seat management
- [x] Dashboard: overview, my rides, sent requests, incoming requests
- [x] User profile management
- [x] Responsive UI (mobile, tablet, desktop)
- [x] Loading states, empty states, error alerts
- [x] Confirmation dialogs for destructive actions
- [x] Leaflet / OpenStreetMap dependency included (no API key required)

## Known Limitations / Next Steps

- **Profile photo upload** requires adding a file storage service (e.g. Cloudinary, AWS S3)
- **Map visualisation** on the ride detail page is scaffolded (Leaflet included) but the map component is not rendered inline — can be added with geocoded coordinates
- **Email notifications** (request accepted/rejected) are not implemented
- **Real-time updates** (WebSocket / Server-Sent Events) for live request status would improve UX
- **Password reset** flow is not implemented
- **Ride completion** status must currently be set manually via API; a cron job to auto-complete past rides would be a natural addition
- **Full-text search** improves with MongoDB Atlas Search or a dedicated geocoding API for geographic proximity matching

---

## License

MIT
