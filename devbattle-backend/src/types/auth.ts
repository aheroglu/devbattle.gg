export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: 'DEVELOPER' | 'ADMIN' | 'MODERATOR';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'DEVELOPER' | 'ADMIN' | 'MODERATOR';
  xp: number;
  level: number;
  title?: string;
  badge?: string;
  preferred_languages: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string | null;
}

export interface OAuthProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  provider: 'google' | 'github';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
  message: string;
}