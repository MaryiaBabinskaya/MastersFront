# Krakowska Lornetka

Krakow has 13 major theaters with a permanent repertoire and many more beyond that. Finding a specific play, checking if it's suitable for kids, or discovering what's on this weekend used to mean visiting each website separately. **Krakowska Lornetka** solves that! One place for the entire Krakow theater scene :)

## What problem does it solve?

- **Search once, not 13 times**: all repertoire from all Krakow theaters in one place
- **Plan ahead**: browse upcoming shows by date, build your theater schedule for the coming weeks or months
- **Upcoming premieres**: see what's opening soon across all theaters, without checking each one separately
- **Kids or adults?**: filtering by age-suitability is already done for you
- **Go in informed**: read reviews from other users before buying a ticket, not after
- **Everything in one account**: log in, save favorite plays, buy tickets; your entire theater life in one place
- **Beyond the stage**: exhibitions, masterclasses, workshops, and everything theater-related that isn't a play lives in **Teatralna Plotka**

## Features

- Browse and search plays across all 13 Krakow theaters
- Filter by date, theater, kids-friendly
- Upcoming premieres section
- Play details with showtimes and ticket booking
- User reviews and ratings
- Favorites list
- User account with avatar
- Calendar view
- Teatralna Plotka - section where you can find exhibitions, masterclasses, workshops and other theater events

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- TanStack React Query
- Framer Motion
- Wouter (routing)

**BFF (Backend for Frontend)**
- Node.js + Express
- Passport.js + express-session (authentication)
- Multer (avatar uploads)

**Backend**
- Spring Boot REST API at `http://localhost:8080`

## Project Structure

```
├── client/        # React frontend
│   └── src/
│       ├── components/   # Header, Footer, PlayCard, ReviewItem, ...
│       ├── hooks/        # React Query hooks (plays, theaters, tickets, ...)
│       ├── pages/        # Home, PlayDetails, Calendar, Account, TheaterPlotka
│       └── lib/
├── server/        # Express BFF
│   ├── auth/     # Passport.js setup, login/register/logout routes
│   ├── routes.ts # API proxy routes to Spring Boot
│   └── index.ts
└── shared/        # Shared types and API contract
    ├── schema.ts  # Drizzle table definitions + TypeScript types
    ├── routes.ts  # API paths and Zod input schemas
    └── models/
        └── auth.ts
```

## Getting Started

### Prerequisites
- Node.js 18+
- Spring Boot backend running on port 8080

### Install dependencies
```bash
npm install
```

### Run in development
```bash
npm run dev
```

The app runs on `http://localhost:5001`.

### Build for production
```bash
npm run build
npm start
```

Example how "Repertuar" section looks like
<img width="1119" height="683" alt="image" src="https://github.com/user-attachments/assets/52e8d139-cbb1-436c-9190-389055be2e78" />
<img width="1056" height="715" alt="image" src="https://github.com/user-attachments/assets/7f5d7711-c633-4e3c-806b-5c40a618ddd2" />
<img width="1133" height="723" alt="image" src="https://github.com/user-attachments/assets/7a67bf2c-e560-4d9f-af9d-667d0aacccf8" />

"Kalendarz"
<img width="1051" height="751" alt="image" src="https://github.com/user-attachments/assets/4e236831-337b-4660-9351-93e9f80939d3" />

"Teatralna plotka"
<img width="1050" height="750" alt="image" src="https://github.com/user-attachments/assets/fe83eadc-f181-4ce9-9cf5-ba52034996d9" />

"Account"
<img width="1096" height="563" alt="image" src="https://github.com/user-attachments/assets/df2ae8ce-09c8-4719-861f-3dd3cf3d2ec0" />

"PLay details"
<img width="1011" height="788" alt="image" src="https://github.com/user-attachments/assets/bbaf9822-3d1f-489e-98fe-5995ff0fb717" />
<img width="890" height="535" alt="image" src="https://github.com/user-attachments/assets/23519e71-5c32-4662-afc5-d77613237e4d" />
<img width="1052" height="694" alt="image" src="https://github.com/user-attachments/assets/b8a0a5b3-3b35-4168-8f3e-b56296b2d996" />










