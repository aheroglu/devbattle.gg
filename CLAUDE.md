# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
cd web
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
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

### Next.js App Router Structure
- Uses Next.js 14 App Router with TypeScript
- Main application pages in `web/src/app/(main)/` route group
- Authentication pages in `web/src/app/auth/`
- Battle pages at `web/src/app/battle/[id]/`

### Middleware Authentication Flow
The `web/src/middleware.ts` implements a three-tier route system:
1. **Public routes** (always accessible): `/`, `/battles`, `/tournaments`, `/leaderboard`
2. **Protected routes** (require auth): `/profile`, `/settings`, `/dashboard`
3. **Auth routes** (redirect when logged in): `/auth/login`, `/auth/register`

Key logic:
- Checks Supabase session for authentication
- Validates profile completion by querying `users` table for `title` and `preferred_languages`
- Redirects incomplete profiles to `/auth/complete-profile`

### Database Schema (Supabase)
Core tables from `web/src/types/index.ts`:
- `users`: Profile data including `title`, `preferred_languages`, XP, level
- `battle_sessions`: Battle metadata with `max_duration`, `difficulty`, `language`
- `battle_participants`: Links users to battles, tracks `result` (PENDING/SUCCESS/FAILURE)
- `battle_submissions`: Stores code submissions with Monaco Editor content

### Realtime System Architecture
Battle system uses Supabase realtime subscriptions for:
- Participant count tracking in battle cards
- Live battle status updates (Join/Watch Live)
- Automatic timeout handling when `max_duration` expires

Key pattern in components:
```typescript
const channel = supabase
  .channel(`battle-${battleId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public', 
    table: 'battle_participants',
    filter: `battle_id=eq.${battleId}`
  }, handleChange)
  .subscribe();
```

### Battle Flow Architecture
1. **Battle Cards** (`web/src/components/battles/battle-card.tsx`): Show realtime participant counts, switch between "Join Battle" and "Watch Live"
2. **Join Modal** (`web/src/components/battles/battle-join-modal.tsx`): Authentication check and participant insertion
3. **Battle Page** (`web/src/app/battle/[id]/page.tsx`): Monaco Editor integration, timeout system, leave functionality

### Styling System
- Cyberpunk theme with CSS custom properties in `web/src/app/globals.css`
- Custom cursor via `cursor: url('/custom-cursor-32x32.png')`
- Radix UI components with Tailwind CSS styling
- GSAP animations loaded dynamically