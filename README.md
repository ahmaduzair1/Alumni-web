# Alumni Connect Web

React + TypeScript + Tailwind CSS v4 + Framer Motion web client for the **Alumni Connect** network. It mirrors the Flutter mobile app UX and uses the same Firebase / Firestore schema (`alumni-connect-e4527`).

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd "D:\web\alumni connect web"
npm install
```

## Run

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Firebase Web App registration

The app ships with a placeholder Firebase config so it compiles:

- Project: `alumni-connect-e4527`
- Config lives in `src/lib/firebase.ts`

**TODO:** In [Firebase Console](https://console.firebase.google.com/) → Project settings → Your apps → **Add app → Web**, register this web app and replace `appId` (and the rest of `firebaseConfig` if the console values differ). Until then, Auth / Firestore will only work if the placeholder `appId` is accepted by the project.

Also enable **Email/Password** auth and ensure Firestore security rules allow the same operations as the Flutter client.

## Role portals

| Role | Login path | Home |
|------|------------|------|
| Alumni | `/login/alumni` | Events, Documents, Experiences, Profile |
| SSD | `/login/ssd` | Requests, Events, Alerts, Settings |
| Department | `/login/dept` | Dashboard, Alumni, Events, Communication, Settings |

Sign-in accepts **email or SAP ID** (looks up `users` where `'sap id' == identifier`, then email/password).

## Stack

- Vite + React 19 + TypeScript
- React Router v7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Firebase Auth, Firestore, Storage
- Framer Motion + Lucide icons
