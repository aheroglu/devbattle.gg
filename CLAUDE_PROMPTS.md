# Claude Code Agent Prompt'ları
## DevBattle.gg Backend Development İçin Özel Prompt'lar

---

## 🎯 Genel Development Context Prompt'u

```
Sen DevBattle.gg projesinin backend development sürecinde uzman bir Node.js/TypeScript developer'ısın. 

PROJE CONTEXT:
- Mevcut: Next.js frontend (standalone)
- Hedef: Next.js frontend + Node.js/Express/Socket.IO backend
- Database: PostgreSQL + Prisma ORM
- Realtime: Socket.IO
- Auth: JWT + Passport.js

DEVELOPMENT PLAN:
6 fazlı development planı takip ediyoruz:
1. Altyapı Hazırlığı
2. Database Schema Design (PostgreSQL + Prisma)
3. Authentication System (JWT Implementation)
4. Core API Development
5. Socket.IO Realtime Implementation
6. Frontend Integration

KOD STANDARTLARI:
- TypeScript strict mode
- ESLint + Prettier
- Clean Architecture principles
- SOLID principles
- Comprehensive error handling
- Type-safe database operations
- RESTful API design
- Socket.IO best practices

Lütfen her kod önerinde:
1. Type safety'yi garanti et
2. Error handling ekle
3. Validation layer'ı dahil et
4. Performance considerations belirt
5. Security best practices uygula
```

---

## 🏗️ Faz 1: Altyapı Kurulum Prompt'u

```
DevBattle.gg backend development Faz 1: Altyapı Kurulumu

GÖREV: Node.js + Express + TypeScript + Prisma + Socket.IO backend projesi kurulumu

GEREKSİNİMLER:
- Node.js 20+ LTS
- TypeScript strict configuration
- Express.js + middleware setup
- Prisma ORM configuration
- Socket.IO server setup
- Docker Compose (PostgreSQL)
- ESLint + Prettier + Husky
- Jest testing framework
- Winston logging
- Environment variables management

PROJE YAPISI:
```
devbattle-backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, logging
│   ├── models/          # Prisma models
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration
│   └── app.ts           # Express app setup
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

Lütfen:
1. Modern Node.js best practices kullan
2. Scalable folder structure oluştur
3. Development workflow optimize et
4. Security configurations ekle
5. Performance monitoring hazırla
```

---

## 🗄️ Faz 2: Database Schema Design Prompt'u

```
DevBattle.gg backend development Faz 2: Database Schema Design

GÖREV: DevBattle.gg için PostgreSQL schema'sını Prisma ile tasarla

GEREKLİ TABLOLAR:
- users (kullanıcı profilleri)
- battle_sessions (battle oturumları)
- battle_participants (katılımcılar)
- problem_definitions (problem tanımları)
- submission_results (kod gönderileri)
- user_achievements (başarımlar)

PRISMA SCHEMA GEREKSİNİMLERİ:
- Type-safe model definitions
- Proper relations (1:1, 1:N, N:M)
- Database constraints
- Indexes for performance
- Default values
- Enum definitions
- Migration scripts

ÖRNEK USER MODEL:
```prisma
model User {
  id                String   @id @default(cuid())
  username          String   @unique
  email             String   @unique
  avatar_url        String?
  xp                Int      @default(0)
  level             Int      @default(1)
  battles_won       Int      @default(0)
  battles_lost      Int      @default(0)
  // ... diğer alanlar
  
  // Relations
  battle_participants BattleParticipant[]
  created_battles     BattleSession[]    @relation("CreatedBattles")
  achievements        UserAchievement[]

  @@map("users")
}
```

Lütfen:
1. Tüm Supabase tablolarını Prisma modeline çevir
2. İlişkileri doğru tanımla
3. Performance için index'leri ekle
4. Data migration script'i hazırla
5. Validation rules ekle
```

---

## 🔐 Faz 3: Authentication System Prompt'u

```
DevBattle.gg backend development Faz 3: Authentication System

GÖREV: JWT + Passport.js authentication sistemi kur

GEREKLİ AUTH ÖZELLİKLERİ:
- OAuth (GitHub, Google, Discord)
- Email/password authentication
- Session management
- User metadata
- Profile completion flow

YENİ JWT AUTH GEREKSİNİMLERİ:
- JWT access tokens (15 min)
- Refresh tokens (7 days)
- OAuth integration (Passport.js)
- Rate limiting
- Password hashing (bcrypt)
- Email verification
- Password reset
- Session blacklisting

IMPLEMENTASYON:
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse>
  async register(userData: RegisterDto): Promise<AuthResponse>
  async refreshToken(refreshToken: string): Promise<AuthResponse>
  async logout(userId: string): Promise<void>
  async verifyEmail(token: string): Promise<void>
}
```

MIDDLEWARE:
- Authentication middleware
- Authorization middleware (role-based)
- Rate limiting middleware
- Input validation middleware

Lütfen:
1. Secure JWT implementation
2. OAuth provider integration
3. Comprehensive error handling
4. Security best practices
5. Migration strategy for existing users
```

---

## 🚀 Faz 4: Core API Development Prompt'u

```
DevBattle.gg backend development Faz 4: Core API Development

GÖREV: RESTful API endpoints ve business logic implementation

API ENDPOINTS:

AUTH ROUTES:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- PUT /api/auth/profile

BATTLE ROUTES:
- GET /api/battles (pagination, filtering)
- POST /api/battles (create)
- GET /api/battles/:id
- PUT /api/battles/:id
- DELETE /api/battles/:id
- POST /api/battles/:id/join
- POST /api/battles/:id/leave
- POST /api/battles/:id/submit

USER ROUTES:
- GET /api/users (leaderboard)
- GET /api/users/:id
- PUT /api/users/:id
- GET /api/users/:id/stats
- GET /api/users/:id/achievements

ARCHITECTURE PATTERN:
```typescript
// Controller → Service → Repository pattern
class BattleController {
  constructor(private battleService: BattleService) {}
  
  async createBattle(req: Request, res: Response) {
    try {
      const battle = await this.battleService.createBattle(req.body);
      res.status(201).json(battle);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

class BattleService {
  constructor(private battleRepository: BattleRepository) {}
  
  async createBattle(data: CreateBattleDto): Promise<BattleSession> {
    // Business logic
    // Validation
    // Database operations
  }
}
```

GEREKSİNİMLER:
- Input validation (Zod)
- Error handling middleware
- Response standardization
- Pagination helpers
- Filtering and sorting
- Rate limiting
- CORS configuration
- API documentation (Swagger)

Lütfen:
1. Clean architecture principles
2. Comprehensive validation
3. Error handling strategy
4. Performance optimization
5. Security considerations
```

---

## ⚡ Faz 5: Socket.IO Realtime Prompt'u

```
DevBattle.gg backend development Faz 5: Socket.IO Realtime Implementation

GÖREV: Socket.IO ile realtime özellikler geliştir

GEREKLİ REALTIME ÖZELLİKLER:
- Battle list updates
- Participant join/leave events
- Code submission results
- Live battle progress
- User presence tracking

SOCKET.IO IMPLEMENTATION:

SERVER SETUP:
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

EVENT HANDLERS:
- join-battle
- leave-battle
- code-submission
- subscribe-battles
- user-presence
- battle-updates

ROOM MANAGEMENT:
- Battle rooms: `battle:${battleId}`
- Global rooms: `battle-list`, `leaderboard`
- User presence: `user:${userId}`

ERROR HANDLING:
- Connection errors
- Authentication failures
- Rate limiting
- Graceful disconnection

Lütfen:
1. Scalable room architecture
2. Event-driven design
3. Error handling ve reconnection
4. Performance optimization
5. Memory leak prevention
```

---

## 🔗 Faz 6: Frontend Integration Prompt'u

```
DevBattle.gg backend development Faz 6: Frontend Integration

GÖREV: Next.js frontend'i custom backend'e bağla

YENİ API CLIENT GEREKSİNİMLERİ:
- HTTP client (fetch/axios)
- Authentication management
- API endpoint integration
- Socket.IO client integration
- Error handling
- Loading states

YENİ API CLIENT:
```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL!;
  }
  
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Implementation with error handling
  }
  
  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse>
  async register(userData: RegisterDto): Promise<AuthResponse>
  async refreshToken(): Promise<AuthResponse>
  async logout(): Promise<void>
  
  // Battle methods
  async getBattles(params?: BattleFilters): Promise<BattleSession[]>
  async createBattle(data: CreateBattleDto): Promise<BattleSession>
  async joinBattle(battleId: string): Promise<void>
}
```

SOCKET.IO CLIENT:
```typescript
const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();
  
  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
        transports: ['websocket', 'polling']
      });
      
      // Event listeners
      newSocket.on('connect', () => console.log('Connected'));
      newSocket.on('disconnect', () => console.log('Disconnected'));
      
      setSocket(newSocket);
      
      return () => newSocket.close();
    }
  }, [token]);
  
  return socket;
};
```

HOOK UPDATES:
- useAuth hook (JWT management)
- useBattle hook (Socket.IO integration)
- useRealtime hook (generic realtime)

MIDDLEWARE UPDATE:
- Next.js middleware for JWT validation
- Route protection
- Token refresh logic

Lütfen:
1. Seamless migration experience
2. Error handling ve fallbacks
3. Loading states management
4. Optimistic updates
5. Connection resilience
```

---

## 🧪 Testing & Debugging Prompt'u

```
DevBattle.gg backend development: Testing & Debugging

GÖREV: Comprehensive testing strategy implementation

TEST TYPES:

1. UNIT TESTS (Jest):
```typescript
// Service tests
describe('BattleService', () => {
  let battleService: BattleService;
  let mockRepository: jest.Mocked<BattleRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    battleService = new BattleService(mockRepository);
  });
  
  it('should create battle with valid data', async () => {
    const battleData = createMockBattleData();
    const result = await battleService.createBattle(battleData);
    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalledWith(battleData);
  });
});
```

2. INTEGRATION TESTS (Supertest):
```typescript
describe('Battle API', () => {
  let app: Express;
  let authToken: string;
  
  beforeAll(async () => {
    app = createTestApp();
    authToken = await getTestAuthToken();
  });
  
  it('POST /api/battles should create battle', async () => {
    const response = await request(app)
      .post('/api/battles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockBattleData)
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

3. SOCKET.IO TESTS:
```typescript
describe('Socket.IO Events', () => {
  let clientSocket: Socket;
  let serverSocket: Socket;
  
  beforeAll((done) => {
    // Setup test sockets
  });
  
  it('should handle battle join event', (done) => {
    clientSocket.emit('join-battle', 'battle-123');
    serverSocket.on('participant-joined', (data) => {
      expect(data.battleId).toBe('battle-123');
      done();
    });
  });
});
```

4. LOAD TESTS (Artillery):
```yaml
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
      
scenarios:
  - name: "Battle API Load Test"
    requests:
      - get:
          url: "/api/battles"
          headers:
            Authorization: "Bearer {{ token }}"
```

DEBUGGING TOOLS:
- Winston logging with structured logs
- Request/response logging middleware
- Error tracking (Sentry integration)
- Performance monitoring
- Database query logging

Lütfen:
1. Test coverage > 80%
2. Mocking strategies
3. Test data management
4. CI/CD integration
5. Performance benchmarks
```

---

## 🚀 Deployment & DevOps Prompt'u

```
DevBattle.gg backend development: Deployment & DevOps

GÖREV: Production-ready deployment setup

DOCKER SETUP:
```dockerfile
# Multi-stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 8000
CMD ["npm", "start"]
```

DOCKER COMPOSE:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis
      
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: devbattle
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

CI/CD PIPELINE (GitHub Actions):
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        uses: railway-deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

MONITORING:
- Health check endpoints
- Prometheus metrics
- Grafana dashboards
- Error tracking (Sentry)
- Log aggregation (Winston + CloudWatch)

SECURITY:
- Environment variables management
- SSL/TLS certificates
- Rate limiting
- CORS configuration
- Security headers
- Input sanitization

Lütfen:
1. Zero-downtime deployment
2. Rollback strategy
3. Environment separation
4. Secrets management
5. Monitoring ve alerting
```

---

## 🔧 Troubleshooting Prompt'u

```
DevBattle.gg backend development: Troubleshooting Guide

GÖREV: Common issues ve solutions

COMMON DEVELOPMENT ISSUES:

1. DATABASE CONNECTION ISSUES:
```typescript
// Connection pool configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Connection health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

2. SOCKET.IO CONNECTION PROBLEMS:
```typescript
// Client-side reconnection logic
const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Implement fallback to polling
});
```

3. JWT TOKEN ISSUES:
```typescript
// Token refresh logic
class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  
  async getValidToken(): Promise<string> {
    const token = localStorage.getItem('auth_token');
    
    if (!token || this.isTokenExpired(token)) {
      return this.refreshToken();
    }
    
    return token;
  }
  
  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = this.performRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }
}
```

4. PERFORMANCE ISSUES:
```typescript
// Database query optimization
const battles = await prisma.battleSession.findMany({
  where: { status: 'ACTIVE' },
  include: {
    participants: {
      select: {
        id: true,
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    },
    problem: {
      select: {
        title: true,
        difficulty: true,
      },
    },
  },
  orderBy: { created_at: 'desc' },
  take: 20,
  skip: page * 20,
});
```

5. MEMORY LEAKS:
```typescript
// Socket.IO memory management
io.on('connection', (socket) => {
  const cleanup = () => {
    socket.removeAllListeners();
    socket.disconnect(true);
  };
  
  socket.on('disconnect', cleanup);
  
  // Timeout for inactive connections
  const timeout = setTimeout(() => {
    cleanup();
  }, 30 * 60 * 1000); // 30 minutes
  
  socket.on('activity', () => {
    clearTimeout(timeout);
  });
});
```

DEBUGGING COMMANDS:
```bash
# Database connection test
npx prisma db pull

# Socket.IO debug mode
DEBUG=socket.io* npm run dev

# Memory usage monitoring
node --inspect=0.0.0.0:9229 dist/app.js

# Load testing
npx artillery run load-test.yml
```

Lütfen:
1. Systematic debugging approach
2. Logging ve monitoring
3. Performance profiling
4. Error reproduction
5. Solution documentation
```

Bu prompt'ları development sürecinin her aşamasında kullanabilirsiniz. Her prompt, o fazın spesifik gereksinimlerini ve best practice'lerini içeriyor.