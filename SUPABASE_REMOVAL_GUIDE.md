# Supabase Kaldırma Rehberi

## 🎯 Hedef
DevBattle.gg projesinden Supabase'i tamamen kaldırarak, custom Node.js + Express + PostgreSQL backend'e geçiş yapmak.

---

## 📋 Kaldırılacak Supabase Kullanımları

### 1. **Authentication (Kimlik Doğrulama)**
- `@supabase/auth-helpers-nextjs` paketi
- `createClientComponentClient()` kullanımları
- `createRouteHandlerClient()` kullanımları
- `createMiddlewareClient()` kullanımları
- `supabase.auth.*` metodları

### 2. **Database Operations (Veritabanı İşlemleri)**
- `supabase.from()` sorguları
- Realtime subscriptions (`supabase.channel()`)
- PostgreSQL changes listeners

### 3. **Realtime Features (Gerçek Zamanlı Özellikler)**
- `supabase.channel()` subscriptions
- `postgres_changes` event listeners
- Battle participant updates
- Battle session changes

---

## 🗂️ Değiştirilecek Dosyalar

### **Frontend Dosyaları**

#### 1. **Authentication Hooks**
- `web/src/hooks/use-auth.ts` - Tamamen yeniden yazılacak
- JWT token management ile değiştirilecek

#### 2. **Middleware**
- `web/src/middleware.ts` - Custom auth middleware
- JWT token validation
- Route protection logic

#### 3. **Auth Components**
- `web/src/app/auth/callback/route.ts` - OAuth callback handler
- `web/src/components/auth/complete-profile-form.tsx` - API calls

#### 4. **Battle Components**
- `web/src/app/battle/[id]/page.tsx` - API calls ve realtime
- `web/src/components/battles/battle-join-modal.tsx` - API calls
- `web/src/components/battles/battle-list.tsx` - API calls ve realtime

#### 5. **Layout Components**
- `web/src/components/layout/navbar.tsx` - Auth state management

#### 6. **Services**
- `web/src/lib/battle-submission-service.ts` - API calls
- `web/src/lib/supabase.ts` - Tamamen kaldırılacak

#### 7. **Configuration**
- `web/package.json` - Supabase dependencies kaldırılacak
- Environment variables güncelleme

---

## 🔄 Değişim Planı

### **Faz 1: Backend API Hazırlığı**
1. Node.js + Express backend kurulumu
2. PostgreSQL + Prisma setup
3. JWT authentication implementation
4. RESTful API endpoints
5. Socket.IO realtime setup

### **Faz 2: Frontend API Client**
1. Axios/Fetch based API client oluşturma
2. JWT token management
3. Socket.IO client setup
4. Error handling ve retry logic

### **Faz 3: Authentication Migration**
1. `useAuth` hook'unu JWT tabanlı yapmak
2. Middleware'i custom auth ile değiştirmek
3. Login/logout flow'unu güncellemek
4. OAuth integration (Google, GitHub)

### **Faz 4: Database Operations Migration**
1. Supabase queries → REST API calls
2. CRUD operations için API endpoints
3. Data validation ve error handling

### **Faz 5: Realtime Migration**
1. Supabase realtime → Socket.IO
2. Battle updates için WebSocket events
3. Participant changes için real-time sync

### **Faz 6: Cleanup**
1. Supabase dependencies kaldırma
2. Unused imports temizleme
3. Environment variables güncelleme
4. Testing ve validation

---

## 🛠️ Yeni Teknoloji Stack

### **Backend**
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT + Passport.js
- **Realtime:** Socket.IO
- **Validation:** Zod
- **Testing:** Jest + Supertest

### **Frontend**
- **Framework:** Next.js 14+ (mevcut)
- **HTTP Client:** Axios
- **Realtime:** Socket.IO Client
- **State Management:** React Context + useReducer
- **Form Validation:** React Hook Form + Zod

---

## 📦 Package Changes

### **Kaldırılacak Packages**
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/supabase-js": "^2.38.4"
}
```

### **Eklenecek Packages**
```json
{
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0",
  "js-cookie": "^3.0.5",
  "@types/js-cookie": "^3.0.6"
}
```

---

## 🔐 Environment Variables

### **Kaldırılacak**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### **Eklenecek**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## ⚠️ Dikkat Edilecek Noktalar

1. **Data Migration:** Mevcut Supabase verilerinin PostgreSQL'e aktarılması
2. **Authentication Flow:** OAuth provider'lar için yeni callback URLs
3. **Realtime Events:** Socket.IO event naming conventions
4. **Error Handling:** API error responses ve frontend handling
5. **Performance:** Database indexing ve query optimization
6. **Security:** JWT token expiration ve refresh logic
7. **Testing:** Tüm API endpoints ve realtime features test edilmeli

---

## 📈 Migration Timeline

| Faz | Süre | Açıklama |
|-----|------|----------|
| Backend Setup | 1 hafta | Node.js + Express + PostgreSQL |
| API Development | 2 hafta | RESTful endpoints + Socket.IO |
| Frontend Migration | 2 hafta | Supabase calls → API calls |
| Testing & Debug | 1 hafta | End-to-end testing |
| **TOPLAM** | **6 hafta** | Tam migration süreci |

---

## ✅ Migration Checklist

### **Backend**
- [ ] Node.js + Express setup
- [ ] PostgreSQL + Prisma setup
- [ ] JWT authentication
- [ ] User management API
- [ ] Battle management API
- [ ] Socket.IO realtime
- [ ] OAuth integration
- [ ] Data migration scripts

### **Frontend**
- [ ] API client setup
- [ ] useAuth hook migration
- [ ] Middleware migration
- [ ] Battle components migration
- [ ] Auth components migration
- [ ] Socket.IO client setup
- [ ] Error handling
- [ ] Package cleanup

### **Testing**
- [ ] API endpoint tests
- [ ] Authentication flow tests
- [ ] Realtime feature tests
- [ ] End-to-end tests
- [ ] Performance tests

### **Deployment**
- [ ] Backend deployment
- [ ] Database setup
- [ ] Environment variables
- [ ] Domain configuration
- [ ] SSL certificates
- [ ] Monitoring setup