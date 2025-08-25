# DevBattle.gg Backend Migration Planı
## Custom Node.js + Express + Socket.IO + PostgreSQL Backend

### 🎯 Migration Hedefi
Mevcut frontend'i tamamen custom Node.js tabanlı backend'e geçirmek ve WebSocket ile gerçek zamanlı işlemleri optimize etmek.

---

## 📋 Aşamalı Migration Stratejisi

### **Faz 1: Altyapı Hazırlığı (1 hafta)**

#### 1.1 Proje Yapısı Oluşturma
```
devbattle-backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

#### 1.2 Teknoloji Stack Kurulumu
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 15+
- **Realtime:** Socket.IO
- **Auth:** JWT + Passport.js
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Monitoring:** Winston + Morgan

#### 1.3 Development Environment
- Docker Compose ile local PostgreSQL
- Hot reload için nodemon
- ESLint + Prettier konfigürasyonu
- Husky pre-commit hooks

---

### **Faz 2: Database Setup (1 hafta)**

#### 2.1 PostgreSQL Database Schema
Oluşturulacak tablolar:
- `users` - Kullanıcı profilleri
- `battle_sessions` - Battle oturumları
- `battle_participants` - Katılımcılar
- `problem_definitions` - Problem tanımları
- `submission_results` - Kod gönderileri
- `user_achievements` - Başarımlar

#### 2.2 Prisma Schema Oluşturma
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
  rank              Int?
  title             String?
  badge             String?
  win_rate          Float    @default(0)
  last_active       DateTime @default(now())
  preferred_languages String[]
  full_name         String?
  website           String?
  github_url        String?
  twitter_url       String?
  bio               String?
  location          String?
  role              UserRole @default(DEVELOPER)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  battle_participants BattleParticipant[]
  created_battles     BattleSession[]    @relation("CreatedBattles")
  achievements        UserAchievement[]

  @@map("users")
}
```

#### 2.3 Database Initialization
- PostgreSQL database setup
- Prisma migrations oluşturma
- Seed data ile test verileri
- Database indexing ve optimization

---

### **Faz 3: Authentication Sistemi (1 hafta)**

#### 3.1 JWT Authentication
```typescript
// JWT Strategy
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user as JWTPayload;
    next();
  });
};
```

#### 3.2 OAuth Integration
- GitHub OAuth (Passport.js)
- Google OAuth (Passport.js)
- Discord OAuth (Passport.js)

#### 3.3 Session Management
- Refresh token mechanism
- Token blacklisting
- Rate limiting

---

### **Faz 4: Core API Development (1.5 hafta)**

#### 4.1 RESTful API Endpoints

**Authentication Routes:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
```

**Battle Routes:**
```
GET    /api/battles
POST   /api/battles
GET    /api/battles/:id
PUT    /api/battles/:id
DELETE /api/battles/:id
POST   /api/battles/:id/join
POST   /api/battles/:id/leave
POST   /api/battles/:id/submit
```

**User Routes:**
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
GET    /api/users/:id/stats
GET    /api/users/:id/achievements
```

#### 4.2 Service Layer Architecture
```typescript
// Battle Service
class BattleService {
  async createBattle(data: CreateBattleDto): Promise<BattleSession> {
    // Business logic
  }
  
  async joinBattle(battleId: string, userId: string): Promise<BattleParticipant> {
    // Validation + DB operations
  }
  
  async submitCode(battleId: string, userId: string, code: string): Promise<SubmissionResult> {
    // Code execution + scoring
  }
}
```

---

### **Faz 5: Socket.IO Realtime Implementation (1 hafta)**

#### 5.1 Socket.IO Server Setup
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

#### 5.2 Realtime Events
```typescript
// Battle Events
socket.on('join-battle', async (battleId: string) => {
  socket.join(`battle:${battleId}`);
  io.to(`battle:${battleId}`).emit('participant-joined', {
    userId: socket.userId,
    timestamp: new Date()
  });
});

socket.on('code-submission', async (data) => {
  const result = await battleService.submitCode(data.battleId, socket.userId, data.code);
  io.to(`battle:${data.battleId}`).emit('submission-result', result);
});

// Battle List Updates
socket.on('subscribe-battles', () => {
  socket.join('battle-list');
});

// When new battle created
io.to('battle-list').emit('battle-created', newBattle);
```

#### 5.3 Room Management
- Battle rooms (`battle:${battleId}`)
- Global battle list (`battle-list`)
- User presence tracking
- Connection cleanup

---

### **Faz 6: Frontend Integration (1 hafta)**

#### 6.1 API Client Setup
```typescript
// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL!;
  }
  
  setToken(token: string) {
    this.token = token;
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options?.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
}
```

#### 6.2 JWT Authentication Implementation
```typescript
// JWT Token Management
const token = localStorage.getItem('auth_token');
const user = jwt.verify(token, JWT_SECRET);

// API Authentication Header
const apiClient = axios.create({
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

#### 6.3 REST API Integration
```typescript
// API Client Setup
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Database Operations via API
const response = await apiClient.get(`/users/${userId}`);
const user = response.data;
```

#### 6.4 Socket.IO Client Integration
```typescript
// Socket Hook
const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();
  
  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.close();
      };
    }
  }, [token]);
  
  return socket;
};
```

#### 6.5 Socket.IO Realtime Implementation
```typescript
// Socket.IO Client Setup
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  auth: {
    token: localStorage.getItem('auth_token')
  }
});

// Battle Updates
socket.on('battle-updated', (data) => {
  setBattle(data);
});

// Participant Changes
socket.on('participant-joined', (participant) => {
  setParticipants(prev => [...prev, participant]);
});
```

#### 6.6 Hook Updates
- `useAuth` hook güncelleme
- `useBattle` hook Socket.IO entegrasyonu
- Error handling ve retry logic

---

### **Faz 7: Testing & Deployment (0.5 hafta)**

#### 7.1 Testing Strategy
- Unit tests (Jest)
- Integration tests (Supertest)
- Socket.IO tests
- Load testing (Artillery)

#### 7.2 Deployment
- Docker containerization
- Railway/Render deployment
- Environment variables setup
- Database migration

---

## 🔧 Development Tools & Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devbattle"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
OAUTH_CALLBACK_URL="http://localhost:3000/auth/callback"

# Judge0 API
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"

# Server
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# Redis (for sessions/caching)
REDIS_URL="redis://localhost:6379"
```

#### Frontend (.env.local)
```env
# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# OAuth (Public keys for client-side)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_GITHUB_CLIENT_ID="your-github-client-id"

# App Configuration
NEXT_PUBLIC_APP_NAME="DevBattle.gg"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📊 Migration Timeline

| Faz | Süre | Açıklama | Bağımlılık |
|-----|------|----------|------------|
| 1 | 1 hafta | Altyapı kurulumu | - |
| 2 | 1 hafta | Database migration | Faz 1 |
| 3 | 1 hafta | Authentication | Faz 2 |
| 4 | 1.5 hafta | Core API | Faz 3 |
| 5 | 1 hafta | Socket.IO | Faz 4 |
| 6 | 1 hafta | Frontend integration | Faz 5 |
| 7 | 0.5 hafta | Testing & Deployment | Faz 6 |

**Toplam Süre:** 6 hafta

---

## 🚨 Risk Faktörleri

1. **Veri Kaybı Riski**
   - Çözüm: Staging environment'da test
   - Backup stratejisi

2. **Downtime**
   - Çözüm: Blue-green deployment
   - Feature flag'ler

3. **Performance Regression**
   - Çözüm: Load testing
   - Monitoring setup

4. **Auth Migration Complexity**
   - Çözüm: Gradual migration
   - Dual auth support

---

## 💰 Maliyet Analizi

### Mevcut (Supabase Pro)
- $25/ay + usage
- Realtime connections: $10/100k
- Database: $0.125/GB

### Yeni (VPS + PostgreSQL)
- VPS (4GB RAM): $20/ay
- PostgreSQL: Ücretsiz
- Judge0: Mevcut

**Tahmini Tasarruf:** %40-60

---

## 📈 Başarı Metrikleri

1. **Performance**
   - API response time < 200ms
   - Socket.IO latency < 50ms
   - Database query time < 100ms

2. **Reliability**
   - Uptime > 99.9%
   - Error rate < 0.1%

3. **Scalability**
   - 1000+ concurrent users
   - 100+ simultaneous battles

4. **Developer Experience**
   - Type safety
   - Hot reload
   - Comprehensive testing

Bu plan doğrultusunda migration sürecini başlatabiliriz. Her faz için detaylı implementation guide'ları hazırlanabilir.