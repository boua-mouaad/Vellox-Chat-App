# Vellox ⚡

A full-stack real-time chat application built with **Spring Boot** and **React**. 

It supports direct 1-on-1 messaging, group chat rooms with shareable invite codes, friend requests, email OTP verification, and social login with Google and GitHub.

---

## What is Vellox?

Vellox is a monorepo project containing both the backend and frontend for a modern chat app:

- **`Vellox/`**: The backend server built with Java 21, Spring Boot, Spring Security, PostgreSQL, and WebSockets (STOMP).
- **`UI/Vellox-front/`**: The web frontend built with React 19, Vite, Tailwind CSS v4, and `@stomp/stompjs`.

---

## Current Features

### 💬 Messaging (STOMP over WebSocket)
- **Direct 1-on-1 Chat**: Private messaging between friends routed through user-specific queues (`/user/queue/messages`).
- **Group Rooms**: Instant broadcast messaging to everyone in a room (`/topic/room/{roomId}`).
- **Persistent History**: Chat history for both private chats and rooms is saved in PostgreSQL and fetched when opening a conversation.
- **Connection Indicator**: Visual green dot showing live WebSocket connection status.
- **Auto-scroll**: Automatically scrolls down to the newest message.

### 🔐 Authentication & Security
- **Email & Password**: Standard signup with BCrypt password hashing.
- **Email OTP Verification**: Sends a 6-digit verification code to the user's email via SMTP (expires in 15 minutes) before the account is activated.
- **JWT Tokens**: Stateless authentication using HMAC-SHA signed tokens stored in `localStorage` and sent with API requests.
- **Social Login**: One-click login with Google and GitHub OAuth2.
- **Protected WebSockets**: A STOMP channel interceptor verifies the JWT on handshake before allowing connections.

### 👥 Friends System
- Search and send friend requests by username.
- View incoming pending requests with badge counter.
- Accept or decline friend requests with immediate sidebar updates.
- Direct access to start chatting once a request is accepted.

### 🏠 Chat Rooms
- Create a room and get an auto-generated 8-character invite code (e.g. `ABCD-1234`).
- Join any room by entering its invite code.
- One-click copy for the room code in the chat header.
- Roles: Track who is the room `OWNER` vs `MEMBER`.

### 🎨 User Interface
- Dark theme built with Tailwind CSS v4.
- Left rail for brand logo, active conversation shortcuts, and user profile popover with sign-out.
- Sidebar with tabs/sections for Friends, Rooms, and Pending Requests, plus a live search filter.
- Modals for creating/joining rooms and adding friends.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 | UI components and client state |
| **Bundler** | Vite | Fast dev server and asset builds |
| **Styling** | Tailwind CSS v4 | Dark-mode styling and layout |
| **Routing** | React Router v7 | Client-side page navigation |
| **HTTP Client** | Axios | REST requests with automatic JWT interceptor |
| **WebSocket Client** | `@stomp/stompjs` v7 | STOMP client over WebSocket |
| **Backend** | Spring Boot 3.4 / 4 | Core API and WebSocket broker |
| **Language** | Java 21 | Backend runtime |
| **Security** | Spring Security 6 | JWT authentication filter + OAuth2 Client |
| **Database** | PostgreSQL | Relational storage for users, rooms, and messages |
| **ORM** | Spring Data JPA / Hibernate | Data access layer |
| **Email** | Spring Mail | SMTP sender for verification codes |
| **Build Tool** | Maven (`./mvnw`) | Backend build and dependency management |

---

## How It Works

```
Browser (React 19 + Vite)
  │
  ├── REST API (Axios -> http://localhost:8100/api)
  │     ├── /auth/*     -> Register, verify OTP, login, /me
  │     ├── /friends/*  -> List friends, send/accept/decline requests
  │     ├── /rooms/*    -> Create room, join by code, list joined rooms
  │     └── /messages/* -> Load message history (private & room)
  │
  └── WebSocket (STOMP -> ws://localhost:8100/ws)
        ├── Connect header: Authorization: Bearer <jwt>
        ├── Send:      /app/chat.room.{roomId}  or  /app/chat.private
        └── Subscribe: /topic/room/{roomId}     or  /user/queue/messages
              │
              ▼
    Spring Boot Backend
      ├── Spring Security & JWT Filter
      ├── WebSocket Channel Interceptor
      ├── Services (Auth, Chat, Friend, Room, Email)
      └── Spring Data JPA
              │
              ├── PostgreSQL (chat_app_db)
              ├── Gmail SMTP (OTP verification emails)
              └── Google / GitHub OAuth2
```

---

## Project Structure

```
ChatApp/
├── README.md                      # This file
├── .env.example                   # Environment variable template for reference
│
├── UI/
│   └── Vellox-front/              # Frontend project (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   │   ├── chat/          # ChatArea.jsx (chat view & message input)
│       │   │   ├── layout/        # AppRail.jsx (nav), Sidebar.jsx (channels/friends)
│       │   │   └── ui/            # AddFriendModal.jsx, JoinRoomModal.jsx
│       │   ├── contexts/
│       │   │   ├── AuthContext.jsx       # User state & JWT management
│       │   │   └── WebSocketContext.jsx  # STOMP client provider
│       │   ├── hooks/
│       │   │   └── useChat.js            # Hook for message history + STOMP subscription
│       │   ├── pages/
│       │   │   ├── AuthPage.jsx          # Login, Register, and OTP verification tabs
│       │   │   ├── DashboardPage.jsx     # Main layout with sidebar and chat
│       │   │   └── OAuth2RedirectHandler.jsx # Catches token after OAuth redirect
│       │   ├── services/
│       │   │   └── api.js                # Axios instance with auth headers
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
│
└── Vellox/                        # Backend project (Spring Boot)
    ├── src/
    │   ├── main/
    │   │   ├── java/com/mouaad/vellox/
    │   │   │   ├── config/        # WebSocketConfig (STOMP endpoints)
    │   │   │   ├── controllers/   # Auth, Chat, Friends, Rooms, Messages
    │   │   │   ├── dtos/          # Request/response DTOs
    │   │   │   ├── entities/      # User, Message, Room, RoomMembership, Friendship
    │   │   │   ├── exceptions/    # Global error handler
    │   │   │   ├── repositories/  # JPA repositories
    │   │   │   ├── security/      # JWT filter, OAuth2 handlers, UserDetails
    │   │   │   ├── services/      # Business logic
    │   │   │   └── VelloxApplication.java
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/                  # Backend tests
    ├── .env                       # Local secrets (gitignored)
    ├── .env.example               # Backend env template
    ├── pom.xml
    └── mvnw / mvnw.cmd
```

---

## Getting Started

### Prerequisites

Make sure you have these installed:
- **Java 21 JDK**
- **Node.js 18+** (with npm)
- **PostgreSQL 14+** running locally

---

### Step 1: Set up the Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE chat_app_db;
```

---

### Step 2: Configure the Backend

Go to the `Vellox` directory:

```bash
cd Vellox
```

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Linux / Mac
cp .env.example .env
```

Open `.env` and fill in your details:

```properties
# Database
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

# Email (for sending OTP codes - Gmail app password works best)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# JWT secret (any long random string, 32+ characters)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# OAuth2 (optional for local testing, required for Google/GitHub buttons)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

> **Tip**: Don't put semicolons `;` at the end of values in `.env` — they get read as part of the password/key and will cause login errors.

---

### Step 3: Run the Backend

From the `Vellox` directory:

```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / Mac
./mvnw clean spring-boot:run
```

The backend will start at **`http://localhost:8100`**.

To run tests:
```bash
.\mvnw.cmd test
```

---

### Step 4: Run the Frontend

Open a new terminal and go to the frontend directory:

```bash
cd UI/Vellox-front
npm install
npm run dev
```

The frontend will start at **`http://localhost:5173`**.

---

## API & WebSocket Reference

### REST Endpoints

#### Auth (`/api/auth`)
| Method | Endpoint | What it does | Auth needed? |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new account (sends OTP email) | No |
| `POST` | `/api/auth/verify-email` | Submit 6-digit OTP code to verify account | No |
| `POST` | `/api/auth/login` | Login with username/email + password (returns JWT) | No |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Yes |
| `GET` | `/oauth2/authorization/google` | Start Google login | No |
| `GET` | `/oauth2/authorization/github` | Start GitHub login | No |

#### Friends (`/api/friends`)
| Method | Endpoint | What it does |
| :--- | :--- | :--- |
| `GET` | `/api/friends` | Get accepted friends list |
| `GET` | `/api/friends/requests/pending` | Get incoming friend requests |
| `POST` | `/api/friends/requests` | Send friend request by username: `{"targetUsername": "alice"}` |
| `PUT` | `/api/friends/requests/{id}/accept` | Accept a friend request |
| `DELETE` | `/api/friends/requests/{id}/decline` | Decline a friend request |

#### Rooms (`/api/rooms`)
| Method | Endpoint | What it does |
| :--- | :--- | :--- |
| `GET` | `/api/rooms` | Get list of rooms you've joined |
| `POST` | `/api/rooms` | Create a new room (returns generated 8-char code) |
| `POST` | `/api/rooms/join` | Join a room using its code: `{"roomCode": "ABCD-1234"}` |

#### Messages (`/api/messages`)
| Method | Endpoint | What it does |
| :--- | :--- | :--- |
| `GET` | `/api/messages/room/{roomId}` | Fetch message history for a room |
| `GET` | `/api/messages/private/{friendId}` | Fetch message history with a friend |

---

### WebSocket (STOMP) Details

- **URL**: `ws://localhost:8100/ws`
- **Connect header**: `Authorization: Bearer <your_token>`

| Message Type | Send Destination | Subscribe Destination |
| :--- | :--- | :--- |
| **Room Message** | `/app/chat.room.{roomId}` | `/topic/room/{roomId}` |
| **Private Message** | `/app/chat.private` | `/user/queue/messages` |

**Payload format:**
```json
{
  "content": "Hey, what's up?",
  "targetId": "friend-uuid-or-room-id"
}
```

---

## 🗺️ What's Next (Roadmap)

Features planned for upcoming updates, roughly in order of priority:

### 1. 📎 File & Media Attachments
- Send images with inline previews (PNG, JPG, GIF).
- Share files and documents (PDF, ZIP) with download links.
- Voice notes with a playable audio bar.
- File storage using S3 or MinIO.

### 2. 🟢 Online Presence & Typing Indicators
- Green dot for users who are currently online (based on WebSocket heartbeats).
- "User is typing..." indicator with debouncing so it doesn't spam the socket.
- "Last seen X minutes ago" timestamps when someone goes offline.

### 3. 📬 Read Receipts & Message Status
- Message status ticks: sent (`✓`), delivered (`✓✓`), read (`✓✓` blue).
- Unread message counters on friends and room tabs in the sidebar.

### 4. 😃 Reactions & Message Actions
- Emoji reactions on messages (👍, ❤️, 😂, etc.).
- Reply / quote a specific message.
- Edit sent messages with an `(edited)` tag.
- Delete messages ("delete for me" or "delete for everyone").
- Pin important messages in a room.

### 5. 🔍 Search
- Search through message history in a conversation.
- Global search across all conversations and friends.

### 6. 📞 Voice & Video Calls (WebRTC)
- 1-on-1 audio and video calling directly in the browser.
- Screen sharing during calls.
- Use WebSocket STOMP for signaling (offer, answer, ICE candidates).

### 7. 🛡️ Room Moderation Tools
- Room owners can kick or ban members.
- Option to assign moderators.
- Public rooms directory to browse and discover open communities.

### 8. 🔔 Push Notifications
- Browser notifications when you receive a message in another tab.
- Subtle sound chimes for incoming messages.

### 9. 🐳 Docker & DevOps
- `docker-compose.yml` to start PostgreSQL, the Spring Boot backend, and Vite frontend with one command.
- Switch to RabbitMQ or Redis message relay for running multiple backend instances.

---

## Contributing

If you'd like to contribute:

1. Fork the repo.
2. Create a new branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
