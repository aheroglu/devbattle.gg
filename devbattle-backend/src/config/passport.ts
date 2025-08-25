import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';
import { OAuthProfile } from '../types/auth';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const oauthProfile: OAuthProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            username: profile.displayName || profile.username || '',
            full_name: profile.displayName || null,
            avatar_url: profile.photos?.[0]?.value || null,
            provider: 'google'
          };

          if (!oauthProfile.email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const authResponse = await AuthService.oauthLogin(oauthProfile);
          return done(null, authResponse);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback'
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const oauthProfile: OAuthProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            username: profile.username || profile.displayName || '',
            full_name: profile.displayName || profile.username || null,
            avatar_url: profile.photos?.[0]?.value || null,
            provider: 'github'
          };

          if (!oauthProfile.email) {
            return done(new Error('No email found in GitHub profile'), undefined);
          }

          const authResponse = await AuthService.oauthLogin(oauthProfile);
          return done(null, authResponse);
        } catch (error) {
          logger.error('GitHub OAuth error:', error);
          return done(error, undefined);
        }
      }
    )
  );
}

// Serialize user for session (not used in JWT strategy, but required by Passport)
passport.serializeUser((user: any, done) => {
  done(null, user.user.id);
});

// Deserialize user from session (not used in JWT strategy, but required by Passport)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthService.getCurrentUser(id);
    done(null, user as any);
  } catch (error) {
    done(error, null);
  }
});

export default passport;