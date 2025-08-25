export interface SocketUser {
  id: string;
  username: string;
  avatar_url?: string;
  level: number;
  role: 'DEVELOPER' | 'ADMIN' | 'MODERATOR';
}

// Client to Server Events
export interface ClientToServerEvents {
  // Authentication
  'authenticate': (token: string) => void;
  
  // Battle Events
  'join-battle': (battleId: string) => void;
  'leave-battle': (battleId: string) => void;
  'battle-subscribe': (battleId: string) => void;
  'battle-unsubscribe': (battleId: string) => void;
  
  // Battle List Events
  'subscribe-battles': () => void;
  'unsubscribe-battles': () => void;
  
  // Code Submission Events
  'code-change': (data: { battleId: string; code: string; language: string }) => void;
  'code-submit': (data: { battleId: string; code: string; language: string }) => void;
  
  // Chat Events
  'battle-message': (data: { battleId: string; message: string }) => void;
  
  // Typing Indicators
  'typing-start': (battleId: string) => void;
  'typing-stop': (battleId: string) => void;
  
  // Presence Events
  'user-presence': (status: 'online' | 'away' | 'busy') => void;
}

// Server to Client Events  
export interface ServerToClientEvents {
  // Authentication
  'authenticated': (user: SocketUser) => void;
  'authentication-error': (error: string) => void;
  
  // Battle Events
  'battle-joined': (data: { battleId: string; participant: any; participantCount: number }) => void;
  'battle-left': (data: { battleId: string; userId: string; participantCount: number }) => void;
  'battle-updated': (data: { battleId: string; battle: any }) => void;
  'battle-started': (data: { battleId: string; startTime: Date }) => void;
  'battle-ended': (data: { battleId: string; winnerId?: string; endTime: Date }) => void;
  'battle-timeout': (battleId: string) => void;
  
  // Battle List Events
  'battle-created': (battle: any) => void;
  'battle-deleted': (battleId: string) => void;
  'battle-status-changed': (data: { battleId: string; status: string; participantCount: number }) => void;
  
  // Code Submission Events
  'code-changed': (data: { battleId: string; userId: string; language: string; timestamp: Date }) => void;
  'submission-result': (data: { 
    battleId: string; 
    userId: string; 
    result: any; 
    isSuccess: boolean;
    timestamp: Date;
  }) => void;
  'participant-completed': (data: {
    battleId: string;
    userId: string;
    username: string;
    completionTime: Date;
    rank: number;
  }) => void;
  
  // Chat Events
  'battle-message': (data: {
    battleId: string;
    user: SocketUser;
    message: string;
    timestamp: Date;
  }) => void;
  
  // Typing Indicators
  'user-typing': (data: { battleId: string; userId: string; username: string }) => void;
  'user-stopped-typing': (data: { battleId: string; userId: string }) => void;
  
  // Presence Events
  'user-online': (data: { userId: string; username: string; status: string }) => void;
  'user-offline': (data: { userId: string; username: string }) => void;
  'user-status-changed': (data: { userId: string; status: string }) => void;
  
  // System Events
  'notification': (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => void;
  'server-message': (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user?: SocketUser;
  battleRooms: Set<string>;
  lastActivity: Date;
  status: 'online' | 'away' | 'busy';
}

// Room naming conventions
export const ROOM_TYPES = {
  BATTLE: 'battle',
  BATTLE_LIST: 'battle-list',
  USER: 'user',
  GLOBAL: 'global'
} as const;

export const getRoomName = (type: keyof typeof ROOM_TYPES, id?: string) => {
  return id ? `${ROOM_TYPES[type]}:${id}` : ROOM_TYPES[type];
};

// Event payload interfaces
export interface BattleJoinData {
  battleId: string;
  participant: {
    id: string;
    user_id: string;
    role: 'SOLVER' | 'SPECTATOR';
    joined_at: Date;
    user: SocketUser;
  };
  participantCount: number;
}

export interface BattleLeaveData {
  battleId: string;
  userId: string;
  participantCount: number;
}

export interface CodeChangeData {
  battleId: string;
  userId: string;
  username: string;
  language: string;
  timestamp: Date;
  codeLength: number;
}

export interface SubmissionResultData {
  battleId: string;
  userId: string;
  username: string;
  result: {
    status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    execution_time?: number;
    memory_usage?: number;
    passed_tests: number;
    total_tests: number;
    error_message?: string;
  };
  isSuccess: boolean;
  timestamp: Date;
}