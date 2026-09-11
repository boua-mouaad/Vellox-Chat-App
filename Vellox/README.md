# Vellox ⚡
### Real-Time Chat & Collaboration Backend

**Vellox** is a scalable, modern real-time chat backend built with **Spring Boot**, **Spring Security (JWT & OAuth2)**, **PostgreSQL**, and **WebSockets (STOMP)**. It powers seamless group chat rooms, 1-on-1 private messaging, friendship workflows, and secure email verification.

---

## 🌟 Key Features

- **🔐 Robust Authentication & Security**:
  - **Local Auth**: User registration with BCrypt password hashing.
  - **Email Verification**: 6-digit one-time verification codes sent via SMTP (expires in 15 minutes).
  - **JWT Tokens**: Stateless authentication using secure HMAC-SHA signed JSON Web Tokens.
  - **Social Login (OAuth2)**: Seamless sign-in via **Google** and **GitHub** with automatic user profile provisioning.
- **💬 Real-Time Messaging (WebSocket + STOMP)**:
  - **Group Chat Rooms**: Live broadcast to `/topic/room/{roomId}` for all room members.
  - **Private Messaging**: Direct 1-on-1 messaging routed via user-specific queues (`/user/queue/messages`).
  - **WebSocket Security**: Pre-send STOMP channel interceptor validates JWT tokens on connection.
- **👥 Friendship Management**:
  - Send, accept, and decline friend requests.
  - Fetch active friends list (`GET /api/friends`).
  - View incoming pending requests (`GET /api/friends/requests/pending`).
- **🏠 Room Management**:
  - Create chat rooms with auto-generated 8-character shareable codes (e.g., `ABCD-1234`).
  - Role-based membership (`OWNER`, `MEMBER`).
  - Join rooms easily with shareable codes.
- **🛡️ Secure Data Transfer**:
  - Sensitive information (such as password hashes) is protected via DTO patterns and `@JsonIgnore`.
  - Chronological message history sorting (`createdAt`).
  - Centralized error and validation handling with uniform JSON responses.

---

## 🚀 Roadmap: New Features to Add

Planned backend and full-stack capabilities for upcoming iterations:

1. **📎 Rich Media & Attachments Support**:
   - Multi-part file upload endpoints (`POST /api/messages/{id}/attachments`).
   - S3 / MinIO object storage integration with pre-signed download URLs.
   - Voice note audio upload and streaming.
2. **🟢 Real-Time Presence & Typing Indicators**:
   - WebSocket disconnect / connect event listener for online/offline presence tracking (`UserPresenceService`).
   - Typing state destination channels (`/topic/room/{roomId}/typing` and `/user/queue/typing`).
   - "Last seen" timestamp storage on user entities.
3. **📬 Message Status & Read Receipts**:
   - Tracking `SENT`, `DELIVERED`, and `READ` receipt states per message and recipient.
   - Live read-receipt broadcast over STOMP (`/topic/room/{roomId}/receipts`).
   - Unread message counters endpoint per conversation.
4. **😃 Message Reactions & Threading**:
   - Add/remove emoji reactions entity (`MessageReaction`) with live broadcast.
   - Parent-child message threading for contextual quote replies.
   - Message edit history and soft-delete capabilities.
5. **🛡️ Advanced Room Moderation & Permissions**:
   - Member management endpoints: kick, ban, promote to moderator/admin.
   - Room settings (public discoverable vs. private invite-only, room avatar upload).
   - Pinned announcement messages in group channels.
6. **📞 WebRTC Signaling Channel**:
   - Dedicated WebSocket signaling handlers for peer-to-peer 1-on-1 audio/video calling.
7. **🔔 Push Notifications**:
   - Web Push (VAPID) service integration for offline message delivery.
8. **⚙️ Distributed Scaling**:
   - Spring WebSocket STOMP relay backed by an external **RabbitMQ** or **Redis** broker for clustered deployments.

---

## 🛠️ Tech Stack

- **Language**: Java 21
- **Framework**: Spring Boot
- **Security**: Spring Security 6+, OAuth2 Client, JJWT (`io.jsonwebtoken:0.13.0`)
- **Database**: PostgreSQL, Spring Data JPA, Hibernate
- **Real-Time**: Spring WebSocket, STOMP Messaging
- **Email**: Spring Mail (JavaMailSender)
- **Tooling**: Maven, Lombok

---

## 📂 Project Structure

```
Vellox/
├── src/
│   ├── main/
│   │   ├── java/com/mouaad/vellox/
│   │   │   ├── config/             # WebSocket & STOMP configurations
│   │   │   ├── controllers/        # REST & WebSocket message endpoints
│   │   │   ├── dtos/               # Request & Response Data Transfer Objects
│   │   │   ├── entities/           # JPA Database Entities
│   │   │   ├── exceptions/         # GlobalExceptionHandler & advice
│   │   │   ├── repositories/       # Spring Data JPA Repositories
│   │   │   ├── security/           # JWT filter, OAuth2 & UserDetails services
│   │   │   ├── services/           # Business logic layer
│   │   │   └── VelloxApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                       # Unit & integration test suites
├── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Java Development Kit (JDK)**: Version 21 or higher
- **PostgreSQL**: Running instance on port `5432`
- **Maven**: (or use the included `./mvnw` wrapper)

### 1. Database Setup

Create a PostgreSQL database named `chat_app_db`:

```sql
CREATE DATABASE chat_app_db;
```

### 2. Environment Variables & Configuration (`.env`)

Create a `.env` file in the `Vellox` root directory (the application automatically loads it via `dotenv-java` and IntelliJ's environment file support):

```properties
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

| Variable | Description |
| :--- | :--- |
| `DB_USERNAME` | PostgreSQL database user (default: `postgres`) |
| `DB_PASSWORD` | PostgreSQL database user password |
| `MAIL_USERNAME` | SMTP sender email (e.g. Gmail) |
| `MAIL_PASSWORD` | SMTP application-specific password (16 characters) |
| `JWT_SECRET` | HMAC-SHA secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console OAuth 2.0 Client Secret |
| `GITHUB_CLIENT_ID` | GitHub Developer Settings OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub Developer Settings OAuth App Client Secret |

> ⚠️ **Important**: Do not append semicolons `;` at the end of lines in `.env` files. In `.env` syntax, semicolons are considered part of the value and will cause authentication failures.

### 3. Build & Run

Run the application with the Maven wrapper:

```bash
# On Linux / macOS
./mvnw clean spring-boot:run

# On Windows (PowerShell)
.\mvnw.cmd clean spring-boot:run
```

By default, the backend starts on port **`8100`**: `http://localhost:8100`.

### 4. Running Tests

Execute the automated test suite:

```bash
# On Linux / macOS
./mvnw test

# On Windows (PowerShell)
.\mvnw.cmd test
```

---

## 📡 API Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new local account | No |
| `POST` | `/api/auth/verify-email` | Verify email with 6-digit code | No |
| `POST` | `/api/auth/login` | Authenticate with email/username & password | No |
| `GET` | `/oauth2/authorization/google` | Initiate Google OAuth2 login | No |
| `GET` | `/oauth2/authorization/github` | Initiate GitHub OAuth2 login | No |

#### Example: Register Request
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password123!"
}
```

#### Example: Login Request
```json
POST /api/auth/login
{
  "identifier": "johndoe",
  "password": "Password123!"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

---

### 2. Friends (`/api/friends`)
*Requires header: `Authorization: Bearer <token>`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/friends` | List all active accepted friends |
| `GET` | `/api/friends/requests/pending` | List all incoming pending friend requests |
| `POST` | `/api/friends/requests` | Send a friend request by `targetUsername` |
| `PUT` | `/api/friends/requests/{id}/accept` | Accept a pending friend request |
| `DELETE` | `/api/friends/requests/{id}/decline` | Decline a pending friend request |

---

### 3. Rooms (`/api/rooms`)
*Requires header: `Authorization: Bearer <token>`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/rooms` | Create a new room (returns shareable code) |
| `POST` | `/api/rooms/join` | Join a room using its 8-character code |

#### Example: Create Room
```json
POST /api/rooms
{
  "roomName": "General Discussion"
}
```
**Response**:
```json
{
  "message": "Room created successfully.",
  "roomCode": "K8X2-9LPA",
  "roomId": "e2f1c843-..."
}
```

---

### 4. Messages (`/api/messages`)
*Requires header: `Authorization: Bearer <token>`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/messages/room/{roomId}` | Fetch chronological chat history for a group room |
| `GET` | `/api/messages/private/{friendId}` | Fetch chronological private chat history with a friend |

---

## ⚡ WebSocket & Real-Time STOMP

- **WebSocket Handshake URL**: `ws://localhost:8100/ws`
- **Allowed Origins**: `http://localhost:5173` (React / Vite)

### STOMP Connection
Send the JWT token in the STOMP connection headers:
```javascript
const headers = {
  Authorization: `Bearer ${jwtToken}`
};
stompClient.connect(headers, onConnect, onError);
```

### Destinations

| Action | Send To (Client -> Server) | Subscribe To (Server -> Client) |
| :--- | :--- | :--- |
| **Room Message** | `/app/chat.room.{roomId}` | `/topic/room/{roomId}` |
| **Private Message** | `/app/chat.private` | `/user/queue/messages` |

#### Payload Format (Room & Private):
```json
{
  "content": "Hello everyone!",
  "targetId": "uuid-here" // Required for private messages
}
```

---

## 🔒 Security Best Practices

- **Password Storage**: Passwords are never stored in plaintext and use industry-standard BCrypt hashing.
- **DTO Exposure**: Database entity models are segregated from API payloads (`MessageResponseDto`, `UserSummaryDto`). Sensitive fields such as `passwordHash` are marked with `@JsonIgnore`.
- **CORS Configuration**: Configured for local development (`http://localhost:5173`) with credentials supported.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
