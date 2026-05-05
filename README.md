# Make A Move - Full Stack Assignment

A premium Tinder-like event discovery and social invite platform.

## 🚀 Project Overview
"Make A Move" allows users to:
- **Discover Profiles**: Swipe through high-fidelity profile cards (Left to Reject, Right to Interest, Top to Go Tonight).
- **Find Events**: Browse premium event cards and see who else is going.
- **Send Invites**: Offer drinks and send invites to matches for specific events.
- **Real-time Interaction**: Real-time notifications and invite management via Socket.io.
- **Conditional Payments**: System handles "Pay only if accepted" logic for drinks.

## 🏗️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT.
- **Design**: Premium "Partywitty" theme with glassmorphism and modern animations.

## 📁 Project Structure
- `/Frontend`: Vite + React application.
- `/Backend`: Express.js server with MongoDB integration.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Setup Backend
1. Go to the Backend directory: `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file from the example: `cp .env.example .env` (or manual copy)
4. Update the `MONGO_URI` and other variables in `.env`.
5. Start the server: `npm run dev`

### 2. Setup Frontend
1. Go to the Frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file from the example: `cp .env.example .env`
4. Start the development server: `npm run dev`

## 🛠️ Features
- **Mobile Responsive**: Fully optimized for mobile with a custom bottom navigation bar.
- **Premium UI**: Modern dark/cream aesthetic with Lucide icons.
- **Swipe Gestures**: Custom pointer-event based swipe logic for a smooth experience.
- **Real-time Inbox**: Instant updates for invite acceptance/rejection.

---
Built as a Full Stack Developer Assessment.
