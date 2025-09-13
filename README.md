Got it ✅ — I'll write a simple and clear **README.md** for your project.
This will help anyone understand how to set up and run your **Client-Sender (Customer)**, **Client-Receiver (Admin)**, and **Backend (Node + MongoDB + Socket.IO)**.

---

# 💬 Realtime Chat System (Customer ↔ Admin)

This project implements a **two-sided chat system**:

* **Customer App (client-sender)** → Start a new session, send messages (rich text supported), and view chat history.
* **Admin App (client-receiver)** → Monitor active sessions, reply to customers, and close sessions (move to history).
* **Backend (Node.js + Express + MongoDB + Socket.IO)** → Manages chat sessions, messages, and real-time communication.

---

## 🚀 Features

* Customers can:

  * Start new chat sessions
  * Send **formatted messages** (bold, italic, underline)
  * Leave a session (but only admin can close it)
  * See active/history sessions

* Admins can:

  * View **active sessions**
  * Join a session and reply to customers in real-time
  * **Close a chat session** → moves it to history
  * View **chat history**

* Backend provides:

  * **REST APIs** for sessions/messages
  * **Socket.IO** for real-time updates
  * MongoDB storage for persistence

---

## 📂 Project Structure

```
/server           # Backend (Node.js + Express + MongoDB + Socket.IO)
  /models         # ChatSession & Message schemas
  /controllers    # REST controllers
  /routes         # Express routes
  /socket         # Socket.IO event handlers
  server.js       # Server entrypoint

/client-sender    # React app (Customer)
  /components
  /pages
  /context
  App.js

/client-receiver  # React app (Admin)
  /components
  /pages
  /context
  App.js
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-repo/chat-system.git
cd chat-system
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a **.env** file:

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/chatdb
SENDER_URL=http://localhost:3000
RECEIVER_URL=http://localhost:3001
```

Run backend:

```bash
npm start
```

---

### 3. Customer (Client-Sender) Setup

```bash
cd client-sender
npm install
npm start
```

Access: 👉 [http://localhost:3000](http://localhost:3000)

---

### 4. Admin (Client-Receiver) Setup

```bash
cd client-receiver
npm install
npm start
```

Access: 👉 [http://localhost:3001](http://localhost:3001)

---

## 🔌 How It Works

1. **Customer** clicks **Start New Chat** → a new session is created and saved in DB.
2. Customer sends messages → stored in MongoDB, broadcast to **Admin + Customer** via Socket.IO.
3. **Admin** joins and replies in real-time.
4. **Admin closes session** → session is marked `closed`, and moved to **history** on both sides.
5. Both sides keep synced with DB via `sessions-refresh` event.

---

## 🛠️ Tech Stack

* **Frontend:** React, Slate.js (rich text editor), Socket.IO Client
* **Backend:** Node.js, Express.js, Socket.IO
* **Database:** MongoDB + Mongoose

---

## ✅ API Endpoints (Backend)

* `GET /api/sessions?status=active` → list sessions
* `GET /api/sessions/:sessionId/messages` → fetch messages for a session
* `POST /api/sessions` → create new session
* `GET /api/sessions/health` → health check

---

## 🎯 Notes

* **DB is source of truth** → both client & admin apps refresh sessions directly from DB via socket events.
* **LocalStorage** is used for customer to keep selected chat on refresh.
* Only **admin** can close a session.

