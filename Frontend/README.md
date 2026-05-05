# Make A Move - Frontend

The frontend application for "Make A Move", built with React 19, Vite, and Tailwind CSS.

## ✨ Features

- **Discovery Feed**: Tinder-like swipe experience (Left = Reject, Right = Interest, Top = Go Tonight).
- **Event Discovery**: Premium grid of tonight's best events.
- **Invite Flow**: Seamless 3-step process to select an event, offer a drink, and confirm the invite.
- **Real-time Inbox**: Live updates when matches accept or reject your invites.
- **Mobile Responsive**: Fully optimized for mobile with a custom bottom navigation bar and touch-friendly gestures.
- **Modern UI**: Dark/Cream aesthetic with Lucide icons and smooth CSS animations.

## 🚀 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **API Client**: Axios
- **Real-time**: Socket.io Client

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
Ensure `VITE_API_BASE_URL` points to your backend (default: `http://localhost:5000/api/v1`).

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📁 Project Structure

- `src/components`: Reusable UI components (ProfileCard, EventCard, DrinkCard, AppShell).
- `src/pages`: Main application pages (Feed, Events, Drink, Summary, Inbox).
- `src/lib`: API, Socket, and Storage utilities.
- `src/context`: Authentication context.
- `src/types`: TypeScript definitions.

## 📱 Mobile Support
The application uses a responsive strategy:
- **Desktop**: Fixed left sidebar.
- **Mobile**: Hidden sidebar + Persistent bottom navigation bar.
- **Gestures**: Custom pointer-event swipe logic with `touch-none` for smooth mobile experience.
