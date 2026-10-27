# SYS Queue Management Demo

A Thai-language, interactive queue-management demo for SYS scrap-metal deliveries. The prototype covers the delivery flow from booking and source weigh-ticket attachment to a QR delivery slip, security-gate check-in, and calling a truck into the plant.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On the sign-in screen, choose one of the sample roles:

- **SYS admin** — adjust daily plant and grade plans, call queues, and approve driver registrations.
- **Scrap-metal broker** — create delivery bookings on behalf of scrap shops.
- **Scrap shop** — book its own trucks and follow delivery status.

The app uses local mock data only. It includes two SYS plants, approved and pending drivers, sample bookings, plan adjustments, and a scannable QR payload on generated delivery slips. Use the queue screen to simulate gate scanning by entering a slip number, call a checked-in truck, and complete its visit.

## Project layout

- `app/types/queue.ts` — shared business types.
- `app/data/mock-data.ts` — typed demo users, plans, plants, drivers, and bookings.
- `app/components/` — reusable UI elements and separate views for login, overview, plans, booking, calling, and driver registry.
- `app/globals.css` — shared SYS Tailwind theme tokens and global styles.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
