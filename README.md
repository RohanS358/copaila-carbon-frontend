<img src="public/logo.svg" width="80" />

# CoPaila Carbon Frontend

CoPaila is a carbon-footprint tracking platform for schools in Nepal. This is its React frontend: it gives school administrators a dashboard to log activity data (electricity, fuel, waste, commuting, etc.) or scan a paper answer sheet, view their emissions report and school-wide recommendations, and gives students a gamified portal — a pet that grows with daily eco-quests, lessons, and leaderboards — to build carbon literacy. The app is bilingual (English/Nepali) and talks to the [CoPaila NestJS backend](https://github.com/RohanS358/copaila-carbon-backend) for auth, data, and calculations.

## Tech stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Animation-88CE02?logo=greensock&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-Data_Viz-8884D8)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **School onboarding** — landing page, school selection/registration, and role selection (school admin vs. student) flows.
- **School carbon dashboard** — emissions broken down by GHG scope, per-student intensity, and a confidence score, visualized with `recharts` and animated with GSAP + ScrollTrigger.
- **Data entry & OMR scanning** — school admins can enter activity data by hand or scan a printed OMR answer sheet (`SchoolOCRScan`) that the backend decodes into an audit submission.
- **Reports & recommendations** — generated school reports and rule-based, bilingual improvement recommendations.
- **Student portal** — a pet-RPG style dashboard (`PetRPG`) where completing daily quests and lessons grows the student's pet, tracked via XP, streaks, and levels.
- **Lessons & achievements** — a Duolingo-style carbon-literacy lesson roadmap with quizzes, plus an achievements screen.
- **Leaderboards** — class, school, and global rankings by student XP.
- **Events** — a school events/calendar view.
- **Bilingual UI** — English/Nepali translations via a language context, including text-to-speech (`services/tts.js`) for the student portal.
- **Route guards** — `RequireAccess` protects role-specific routes, `RedirectIfAuth` skips auth pages for already-logged-in users.

## Project structure

```
src/
  pages/        Route-level pages (Landing, dashboards, registration, student portal)
  layouts/       Shared page layouts (Main, Student)
  components/    Shared UI components, including Pet/ (pet-RPG visuals)
  context/       Auth, app, and language React contexts
  services/      API client, pet progress store, recommendation engine, TTS
  i18n/           Nepali translation strings
  data/           Static data (e.g. OMR sheet layout, shared with the backend)
```

## Getting started

### Prerequisites
- Node.js 18+
- A running instance of the [CoPaila backend](https://github.com/RohanS358/copaila-carbon-backend) (or its API URL)

### Setup

```bash
npm install --legacy-peer-deps
npm run dev        # start the Vite dev server (--host, accessible on LAN)
npm run build       # production build
npm run preview     # preview the production build
```

Set the backend API URL via an environment variable (defaults to `http://localhost:3000/api/v1`):

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
