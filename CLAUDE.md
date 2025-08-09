# DevBattle.gg Development Guidelines

## Project Overview
DevBattle.gg is a real-time coding battle platform built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. Users can join coding battles, compete in real-time, and track their progress.

## Development Workflow

### Commit & Push Strategy
**IMPORTANT**: After every significant change or feature implementation, always commit and push changes immediately. This ensures:
- Better version control and progress tracking
- Safer development with frequent backups
- Clear history of feature development
- Easy rollback if needed

### Commit Guidelines
1. Use descriptive commit messages following the format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `enhance:` for improvements to existing features
   - `refactor:` for code restructuring
   - `style:` for UI/styling changes

2. Always include the Claude Code footer in commits:
   ```
   > Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Components**: Radix UI primitives
- **Editor**: Monaco Editor for code editing
- **Animations**: GSAP for advanced animations

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage

### Key Dependencies
- `nextjs-toploader`: Page transition loading indicators
- `next-themes`: Dark/light theme management
- `react-hook-form`: Form handling
- `zod`: Schema validation

## Project Structure

### Important Files
- `/web/src/app/`: Next.js app router pages
- `/web/src/components/`: Reusable components
- `/web/src/types/index.ts`: TypeScript type definitions
- `/web/src/app/globals.css`: Global styles and theme
- `/web/public/`: Static assets including custom cursor

### Database Tables
- `users`: User profiles and information
- `battle_sessions`: Battle configuration and metadata
- `battle_participants`: Active participants in battles
- `user_submissions`: Code submissions and results

## Development Guidelines

### Authentication Flow
1. Users authenticate via Supabase Auth (email/password or OAuth)
2. Middleware checks authentication status and profile completion
3. Incomplete profiles redirect to `/complete-profile`
4. Complete profiles access protected routes

### Realtime Features
- Battle participant tracking with Supabase subscriptions
- Live updates for battle status changes
- Real-time progress tracking during battles
- Automatic cleanup on participant leave/timeout

### Battle System
- Battles have configurable duration (max_duration in seconds)
- Automatic timeout handling removes participants and redirects
- Progress bars show time elapsed vs total duration
- Modal-based joining system with authentication checks

### Styling Conventions
- Cyberpunk theme with green/blue accents
- Custom cursor using `custom-cursor-32x32.png`
- Custom scrollbars with green glow effects
- Responsive design with mobile-first approach

## Testing & Quality

### Commands to Run After Changes
```bash
# Type checking (if available)
npm run typecheck

# Linting (if available)
npm run lint

# Build verification
npm run build

# Development server
npm run dev
```

### Code Quality
- Always use TypeScript for type safety
- Follow existing code conventions and patterns
- Implement error handling for async operations
- Use proper loading states for async UI updates

## Security Considerations
- Never expose sensitive data in client-side code
- Use Supabase RLS (Row Level Security) policies
- Validate user inputs on both client and server
- Implement proper authentication checks in middleware

## Performance Optimization
- Use dynamic imports for heavy components (Monaco Editor)
- Implement proper loading states
- Optimize realtime subscriptions to prevent memory leaks
- Use memoization for expensive calculations

## Deployment
- The project is set up for deployment on Vercel/similar platforms
- Environment variables should be configured in deployment environment
- Database migrations should be applied via Supabase dashboard

## Development Notes
- Always test realtime features with multiple browser sessions
- Verify authentication flows work correctly
- Test battle timeout functionality with short durations
- Ensure responsive design works on mobile devices

## Recent Features Implemented
1.  Battle timeout system with automatic participant removal
2.  Custom cursor implementation
3.  NextJS TopLoader for page transitions  
4.  Realtime participant tracking in battle cards
5.  Modal-based battle joining system
6.  Leave battle confirmation dialogs
7.  Timer-based progress bars for live battles

---

**Remember**: Always commit and push after implementing each feature or significant change!