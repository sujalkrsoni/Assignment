# Make A Move - Backend

The backend API and real-time server for "Make A Move", built with Node.js, Express, and MongoDB.

## ✨ Features

- **Auth System**: JWT-based authentication with user registration and login.
- **Discovery API**: Swipe logic with intent tracking (Reject, Interested, Go Tonight).
- **Invite Management**: Multi-step invite lifecycle with conditional payment logic.
- **Real-time Notifications**: Instant invite alerts via Socket.io.
- **Business Logic**:
  - Event tickets are paid upfront.
  - Drinks are only charged upon invite acceptance.
  - Verification gates for premium features.
  - 24-hour invite expiration.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Auth**: JSON Web Tokens (JWT) & Bcrypt

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Update `MONGO_URI` with your connection string (Local or Atlas).

### 3. Run Development Server
```bash
npm run dev
```
The server will run on `http://localhost:5000` by default.

## 📁 API Endpoints

### Discovery
- `GET /api/v1/profiles`: Fetch discoverable profiles.
- `POST /api/v1/profiles/:id/swipe`: Record a swipe with intent.

### Events
- `GET /api/v1/events`: List available tonight events.

### Invites
- `POST /api/v1/invite`: Send a new invite (requires interest/go_tonight).
- `POST /api/v1/invite/respond`: Accept or reject a received invite.
- `GET /api/v1/invites`: Fetch received or sent invites.

## 🔌 Socket.io Events
The server emits the following events to authenticated clients:
- `invite:created`: Notifies receiver of a new invite.
- `invite:sent`: Confirms to sender that invite was sent.
- `invite:updated`: Notifies both parties on status changes.
