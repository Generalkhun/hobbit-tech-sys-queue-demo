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
- **Security guard** — use the first station to verify delivery slips and record trucks arriving at the gate. Queue calling remains with the SYS scrap operations team.

The app uses local mock data only. It includes two SYS plants, approved and pending drivers, sample bookings, plan adjustments, and a scannable QR payload on generated delivery slips. Use the queue screen to simulate gate scanning by entering a slip number, call a checked-in truck, and complete its visit.

The sidebar follows the earlier SYS navigation structure, with separate main workflow and data-management sections. Security accounts only see the dashboard, gate station, and queue lookup. The **เรียกรถ (รปภ.)** screen records the first-station gate check; **จัดการการจัดส่ง (ปศ.)** is the scrap operations team's separate queue-calling screen.

Creating a delivery slip follows four non-clickable progress steps: delivery details and source weigh ticket, registered vehicle selection, approved driver selection, and successful save with the generated QR delivery slip.

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
