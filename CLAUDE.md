# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Frontend (Next.js)
cd web
npm run dev    # Start Next.js development server
npm run build  # Build for production
npm run lint   # Run ESLint

# Backend (Node.js + Express)
cd backend
npm run dev    # Start Express server with nodemon
npm run build  # Build TypeScript to JavaScript
npm run start  # Start production server
npm test       # Run Jest tests
npm run db:migrate  # Run Prisma migrations
npm run db:seed     # Seed database with test data
```

### Commit & Push Strategy
After every significant change or feature implementation, always commit and push changes immediately using:
```bash
git add .
git commit -m "feat: description"
git push origin main
```

Include this footer in all commits:
```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Architecture

### Full-Stack Architecture Overview
**Current Migration Status: Transitioning from Supabase to Custom Backend**

- **Frontend**: Next.js 14 with App Router (TypeScript)
- **Backend**: Node.js + Express + TypeScript + Socket.IO
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport.js
- **Realtime**: Socket.IO WebSocket connections
- **Code Execution**: Judge0 API integration

### Backend Structure
```
backend/
├── src/
│   ├── controllers/     # Route handlers (REST API)
│   ├── middleware/      # Auth, validation, logging
│   ├── models/          # Prisma client and schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   ├── socket/          # Socket.IO event handlers
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript type definitions
│   ├── config/          # App configuration
│   └── app.ts           # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── tests/               # Test files (Jest + Supertest)
└── docker-compose.yml   # Local PostgreSQL setup
```

### Frontend Structure (Next.js)
- Main application pages in `web/src/app/(main)/` route group
- Authentication pages in `web/src/app/auth/`
- Battle pages at `web/src/app/battle/[id]/`
- API client integration in `web/src/lib/api-client.ts`
- Socket.IO client hooks in `web/src/hooks/use-socket.ts`

### Authentication Flow (JWT-Based)
The authentication system uses JWT tokens with refresh token mechanism:

1. **Login/Register**: User provides credentials → Backend validates → Returns JWT access token (15min) + refresh token (7days)
2. **API Requests**: Frontend includes `Authorization: Bearer <token>` header
3. **Route Protection**: `web/src/middleware.ts` validates JWT tokens
4. **Token Refresh**: Automatic refresh when access token expires
5. **OAuth Integration**: GitHub, Google, Discord via Passport.js

### Database Schema (PostgreSQL + Prisma)
Core tables managed by Prisma ORM:
- `users`: Profile data with JWT-compatible structure
- `battle_sessions`: Battle metadata linked to `problem_definitions`
- `battle_participants`: User-battle relationships with roles (SOLVER/SPECTATOR)
- `problem_definitions`: Coding problems with test cases
- `submission_results`: Code execution results with Judge0 integration
- `user_achievements`: Achievement system

### API Architecture (RESTful)
**Base URL**: `http://localhost:8000/api`

**Authentication Routes**:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user

**Battle Routes**:
- `GET /battles` - List battles (paginated, filtered)
- `POST /battles` - Create new battle
- `GET /battles/:id` - Get battle details
- `POST /battles/:id/join` - Join battle
- `POST /battles/:id/submit` - Submit code solution

**User Routes**:
- `GET /users` - Leaderboard
- `GET /users/:id` - User profile
- `PUT /users/:id` - Update profile

### Realtime System (Socket.IO)
Real-time features powered by WebSocket connections:

**Connection Setup**:
```typescript
// Client-side connection with JWT auth
const socket = io('http://localhost:8000', {
  auth: { token: localStorage.getItem('auth_token') }
});
```

**Room Management**:
- `battle:${battleId}` - Battle-specific events
- `battle-list` - Global battle list updates  
- `user:${userId}` - User-specific notifications

**Key Events**:
- `join-battle` - User joins battle room
- `participant-joined` - Broadcast participant updates
- `code-submitted` - Code submission results
- `battle-updated` - Battle status changes

### Code Execution Pipeline
1. **Submission**: User submits code via API
2. **Validation**: Backend validates against problem test cases  
3. **Execution**: Judge0 API runs code against all test cases
4. **Scoring**: Calculate score based on passed tests
5. **Storage**: Save results to `submission_results` table
6. **Broadcast**: Notify spectators via Socket.IO

### Migration Strategy
Following 6-phase migration plan from Supabase to custom backend:

1. **Phase 1**: Backend infrastructure setup (Node.js + Express + TypeScript)
2. **Phase 2**: Database migration (Supabase PostgreSQL → Custom PostgreSQL + Prisma)
3. **Phase 3**: Authentication system (Supabase Auth → JWT + Passport.js)
4. **Phase 4**: API development (Supabase queries → REST API endpoints)
5. **Phase 5**: Realtime features (Supabase realtime → Socket.IO)
6. **Phase 6**: Frontend integration (Update API calls and WebSocket connections)

### Development Guidelines
- **Type Safety**: Strict TypeScript configuration across frontend and backend
- **Error Handling**: Comprehensive error middleware and client-side error boundaries  
- **Testing Strategy**: Unit tests (Jest), Integration tests (Supertest), Socket.IO tests
- **Security**: JWT validation, input sanitization, CORS configuration, rate limiting
- **Performance**: Database indexing, connection pooling, caching with Redis
- **Code Quality**: ESLint + Prettier, pre-commit hooks, clean architecture principles

### Environment Variables
**Backend (.env)**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/devbattle
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com  
JUDGE0_API_KEY=your-judge0-api-key
PORT=8000
NODE_ENV=development
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### Styling System
- Cyberpunk theme with CSS custom properties in `web/src/app/globals.css`
- Custom cursor via `cursor: url('/custom-cursor-32x32.png')`
- Radix UI components with Tailwind CSS styling
- GSAP animations loaded dynamically