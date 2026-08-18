# FriendPlay — Phase 1 (Foundation + Auth)

Multiplayer game platform (Ludo, Spades, 29) — এই ধাপে backend auth API এবং
frontend routing/login/register সম্পূর্ণ করা হয়েছে।

## যা তৈরি হয়েছে

**Backend (`server/`)**
- Express + TypeScript, MVC-style (`routes → controller → service`)
- PostgreSQL + Prisma (User model)
- Register / Login / Logout / Me — JWT দিয়ে HttpOnly cookie session
- bcrypt password hashing, Zod validation, centralized error handling

**Frontend (`client/`)**
- React + TypeScript + Vite + Tailwind v4
- Login ও Register পেজ (felt-green table থিম, animated dice signature element)
- Auth context (`useAuth`) — page reload হলেও session ধরে রাখে
- Protected routes — লগইন ছাড়া `/lobby`, `/profile` ইত্যাদিতে ঢোকা যাবে না
- Lobby, Profile, Leaderboard, Game Room পেজের placeholder (পরের Phase-এ ভরা হবে)

## সেটআপ

### ১. Database বানান
```bash
psql -U postgres
CREATE DATABASE friendplay_db;
```

### ২. Backend
```bash
cd server
npm install
```

`.env` ফাইলে `DATABASE_URL` আপনার নিজের PostgreSQL username/password দিয়ে বদলে দিন।
`JWT_SECRET` ইতিমধ্যে একটা random value দেওয়া আছে (dev-এর জন্য ঠিক আছে, production-এ
নতুন করে generate করবেন)।

```bash
npx prisma migrate dev --name init
npm run dev
```

`http://localhost:5000/health` খুলে `{"status":"ok"}` দেখলে backend ঠিকভাবে চলছে।

### ৩. Frontend
```bash
cd client
npm install
npm run dev
```

`http://localhost:5173` খুলুন — Register করে নতুন অ্যাকাউন্ট বানিয়ে টেস্ট করুন।

## যাচাই করা হয়েছে
- Backend: `tsc --noEmit` কোনো error ছাড়া pass করে (শুধু `PrismaClient` টাইপ
  local sandbox-এ verify করা যায়নি, কারণ Prisma engine ডাউনলোডের জন্য যে
  ডোমেইন লাগে সেটা এই sandbox-এ ব্লকড ছিল — আপনার নিজের মেশিনে
  `npx prisma migrate dev` চালালেই এটা ঠিকভাবে generate হয়ে যাবে)
- Frontend: `tsc -b` এবং `vite build` — দুটোই কোনো error ছাড়া সম্পূর্ণ হয়েছে

## পরের ধাপ (Phase 2)
- WebSocket / Socket.IO
- Room creation, join, player presence, reconnection
