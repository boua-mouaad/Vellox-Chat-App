# Vellox Frontend ⚡

The React web client for the Vellox chat app.

For full project instructions and backend setup, check the main [README.md](../../README.md).

---

## What's in here?

This is a single-page app built with **React 19**, **Vite**, and **Tailwind CSS v4**. It talks to the Spring Boot backend using:
- **Axios** for REST API requests (login, registration, loading friends, rooms, and chat history).
- **`@stomp/stompjs`** over WebSockets for live messages.

---

## Quick Start

### 1. Install dependencies

```bash
cd UI/Vellox-front
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

> Make sure the backend is running at `http://localhost:8100` so authentication and WebSockets work properly.

---

## Available Scripts

- `npm run dev`: Starts the Vite development server with hot reload.
- `npm run build`: Compiles and minifies the app into `dist/` for production.
- `npm run preview`: Runs a local web server to test the production build.
- `npm run lint`: Runs Oxlint to check for code quality issues.

---

## Key Files & Structure

```
src/
├── components/
│   ├── chat/ChatArea.jsx       # The main chat window and message input
│   ├── layout/Sidebar.jsx      # Friends list, joined rooms, pending requests, search
│   ├── layout/AppRail.jsx      # Left sidebar rail with profile and logout
│   └── ui/                     # Modals for joining/creating rooms and adding friends
├── contexts/
│   ├── AuthContext.jsx         # Handles user login, signup, OTP, and JWT storage
│   └── WebSocketContext.jsx    # Manages STOMP WebSocket connection
├── hooks/
│   └── useChat.js              # Hook that loads chat history and listens for live messages
├── pages/
│   ├── AuthPage.jsx            # Sign in, sign up, and email OTP verification
│   ├── DashboardPage.jsx       # Main chat layout
│   └── OAuth2RedirectHandler.jsx # Receives token after Google/GitHub login
└── services/
    └── api.js                  # Axios setup with auth header interceptor
```
