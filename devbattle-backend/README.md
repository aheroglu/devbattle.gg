# DevBattle Backend

Custom Node.js + Express + Socket.IO + PostgreSQL backend for DevBattle.gg

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies:**
```bash
cd devbattle-backend
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup:**
```bash
npm run db:migrate
npm run db:seed
```

4. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
devbattle-backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models (Prisma)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── config/         # Configuration files
│   └── app.ts          # Main application entry
├── prisma/             # Database schema & migrations
├── logs/               # Application logs
└── dist/               # Compiled JavaScript output
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
```

### Database
```bash
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

### Testing & Quality
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devbattle"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Judge0 API
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"

# Server
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport.js
- **Realtime**: Socket.IO
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston + Morgan

### Core Features
- 🔐 JWT-based authentication with OAuth integration
- 🏁 Real-time coding battles with Socket.IO
- 👥 User management and profiles
- 📊 Battle statistics and leaderboards
- 🎯 Code execution with Judge0 API
- 📝 Comprehensive logging and error handling
- 🔒 Security middleware (Helmet, CORS, Rate Limiting)

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login        # User login
POST   /api/auth/register     # User registration
POST   /api/auth/refresh      # Refresh JWT token
POST   /api/auth/logout       # User logout
GET    /api/auth/me           # Get current user
PUT    /api/auth/profile      # Update user profile
```

### Battles
```
GET    /api/battles           # Get all battles
POST   /api/battles           # Create new battle
GET    /api/battles/:id       # Get battle by ID
PUT    /api/battles/:id       # Update battle
DELETE /api/battles/:id       # Delete battle
POST   /api/battles/:id/join  # Join battle
POST   /api/battles/:id/leave # Leave battle
POST   /api/battles/:id/submit # Submit code solution
```

### Users
```
GET    /api/users             # Get all users
GET    /api/users/:id         # Get user by ID
PUT    /api/users/:id         # Update user
GET    /api/users/:id/stats   # Get user statistics
GET    /api/users/:id/achievements # Get user achievements
```

## 📡 Socket.IO Events

### Connection Events
```typescript
// Client -> Server
socket.emit('join-battle', battleId)
socket.emit('leave-battle', battleId)
socket.emit('code-submission', { battleId, code })
socket.emit('subscribe-battles')

// Server -> Client
socket.on('battle-updated', battleData)
socket.on('participant-joined', participantData)
socket.on('participant-left', participantData)
socket.on('submission-result', resultData)
socket.on('battle-created', battleData)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t devbattle-backend .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

## 📈 Monitoring & Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All application logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Zod schema validation
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use ESLint and Prettier for code formatting
3. Write tests for new features
4. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details