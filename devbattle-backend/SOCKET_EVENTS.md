# Socket.IO Events Documentation

This document describes all the real-time events available in the DevBattle.gg Socket.IO implementation.

## Authentication

Before using any Socket.IO features, clients must authenticate with a valid JWT token.

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Listen for authentication result
socket.on('authenticated', (user) => {
  console.log('Authenticated as:', user);
});

socket.on('authentication-error', (error) => {
  console.error('Authentication failed:', error);
});
```

## Battle Events

### Join/Leave Battle

```javascript
// Join a battle room to receive real-time updates
socket.emit('join-battle', battleId);

// Leave a battle room
socket.emit('leave-battle', battleId);

// Subscribe to battle updates without joining as participant
socket.emit('battle-subscribe', battleId);
socket.emit('battle-unsubscribe', battleId);
```

### Battle State Changes

```javascript
// Battle started
socket.on('battle-started', (data) => {
  console.log('Battle started:', data);
  // { battleId, startTime }
});

// Battle ended
socket.on('battle-ended', (data) => {
  console.log('Battle ended:', data);
  // { battleId, winnerId?, endTime }
});

// Battle timed out
socket.on('battle-timeout', (battleId) => {
  console.log('Battle timed out:', battleId);
});

// Battle updated (general updates)
socket.on('battle-updated', (data) => {
  console.log('Battle updated:', data);
  // { battleId, battle }
});
```

### Participant Events

```javascript
// User joined battle
socket.on('battle-joined', (data) => {
  console.log('Participant joined:', data);
  // { battleId, participant, participantCount }
});

// User left battle
socket.on('battle-left', (data) => {
  console.log('Participant left:', data);
  // { battleId, userId, participantCount }
});

// Participant completed the challenge
socket.on('participant-completed', (data) => {
  console.log('Participant completed:', data);
  // { battleId, userId, username, completionTime, rank }
});
```

## Battle List Events

Subscribe to global battle list updates:

```javascript
// Subscribe to battle list updates
socket.emit('subscribe-battles');

// Unsubscribe from battle list updates
socket.emit('unsubscribe-battles');

// New battle created
socket.on('battle-created', (battle) => {
  console.log('New battle created:', battle);
});

// Battle deleted
socket.on('battle-deleted', (battleId) => {
  console.log('Battle deleted:', battleId);
});

// Battle status changed (participant joined/left)
socket.on('battle-status-changed', (data) => {
  console.log('Battle status changed:', data);
  // { battleId, status, participantCount }
});
```

## Code Submission Events

### Live Code Changes

```javascript
// Send code change event (for live coding indicators)
socket.emit('code-change', {
  battleId: 'battle-id',
  code: 'current code',
  language: 'javascript'
});

// Receive code change from other participants
socket.on('code-changed', (data) => {
  console.log('Code changed by:', data);
  // { battleId, userId, username, language, timestamp, codeLength }
});
```

### Code Submission

```javascript
// Notify about code submission
socket.emit('code-submit', {
  battleId: 'battle-id',
  code: 'final code',
  language: 'javascript'
});

// Receive submission results
socket.on('submission-result', (data) => {
  console.log('Submission result:', data);
  // { battleId, userId, username, result, isSuccess, timestamp }
});
```

## Chat System

```javascript
// Send chat message
socket.emit('battle-message', {
  battleId: 'battle-id',
  message: 'Hello everyone!'
});

// Receive chat messages
socket.on('battle-message', (data) => {
  console.log('Chat message:', data);
  // { battleId, user, message, timestamp }
});
```

## Typing Indicators

```javascript
// Start typing indicator
socket.emit('typing-start', battleId);

// Stop typing indicator
socket.emit('typing-stop', battleId);

// Receive typing indicators
socket.on('user-typing', (data) => {
  console.log('User typing:', data);
  // { battleId, userId, username }
});

socket.on('user-stopped-typing', (data) => {
  console.log('User stopped typing:', data);
  // { battleId, userId }
});
```

## User Presence

```javascript
// Update user status
socket.emit('user-presence', 'online'); // 'online', 'away', 'busy'

// Receive user status changes
socket.on('user-online', (data) => {
  console.log('User online:', data);
  // { userId, username, status }
});

socket.on('user-offline', (data) => {
  console.log('User offline:', data);
  // { userId, username }
});

socket.on('user-status-changed', (data) => {
  console.log('User status changed:', data);
  // { userId, status }
});
```

## System Notifications

```javascript
// Receive system notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
  // { type: 'info'|'success'|'warning'|'error', message }
});

// Receive server messages
socket.on('server-message', (message) => {
  console.log('Server message:', message);
});
```

## Room Structure

The Socket.IO implementation uses the following room naming convention:

- `battle:{battleId}` - Battle-specific events
- `battle-list` - Global battle list updates
- `user:{userId}` - User-specific events
- `global` - System-wide broadcasts

## Error Handling

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication token required') {
    // Handle authentication error
  }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, possibly due to authentication failure
  }
});
```

## Rate Limiting

Socket.IO events are rate-limited to prevent abuse:

- Code changes: Throttled to prevent spam
- Chat messages: Limited per minute
- Typing indicators: Automatically cleared after inactivity

## Best Practices

1. **Always authenticate** before emitting events
2. **Handle connection errors** gracefully
3. **Subscribe/unsubscribe** from rooms appropriately
4. **Throttle code changes** on the client side
5. **Clean up event listeners** when components unmount

## Admin API Endpoints

Admins and moderators can use REST API endpoints to manage Socket.IO:

```http
GET /api/socket/stats
POST /api/socket/notify-user
POST /api/socket/notify-battle  
POST /api/socket/notify-all
POST /api/socket/server-message
POST /api/socket/force-battle-timeout
```

All admin endpoints require authentication and appropriate role permissions.

## Example Usage

### React Hook for Battle Real-time Updates

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useBattleSocket(battleId, token) {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3001', {
      auth: { token }
    });

    newSocket.on('authenticated', () => {
      newSocket.emit('join-battle', battleId);
    });

    newSocket.on('battle-joined', (data) => {
      setParticipants(prev => [...prev, data.participant]);
    });

    newSocket.on('battle-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-battle', battleId);
      newSocket.close();
    };
  }, [battleId, token]);

  return { socket, participants, messages };
}
```

This documentation covers all the real-time features available in the DevBattle.gg Socket.IO implementation.