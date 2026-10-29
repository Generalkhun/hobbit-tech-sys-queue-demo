# SYS Queue Management Demo

A Thai-language, interactive queue-management demo for SYS scrap-metal deliveries. The prototype covers the delivery flow from booking and source weigh-ticket attachment to a QR delivery slip, security-gate check-in, and calling a truck into the plant.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On the sign-in screen, choose one of the sample roles:

- **จศ. · เจ้าหน้าที่จัดหาเศษเหล็ก** — demo administrator; view booking totals, adjust plans, call queues, and approve driver registrations.
- **ปศ. · ทีมปฏิบัติการเศษเหล็ก** — set factory/slot vehicle capacities, call security to summon vehicles, and move bookings between plants.
- **Scrap-metal broker** — create delivery bookings on behalf of scrap shops.
- **Scrap shop** — book its own trucks and follow delivery status.
- **Security guard** — scan a delivery pass at the first station to issue a queue, call the driver when notified by ปศ., and issue the gate pass when the vehicle enters.

The app uses local mock data only. It includes two SYS plants, approved and pending drivers, sample bookings, plan adjustments, mock vehicle/driver blacklist entries, and a scannable QR payload on generated delivery slips. A deterministic v1 scheduler first balances vehicle counts per plant and slot, then compares grade target shortages and incoming tonnage. It rejects full slots and displays its assignment reasoning. Slot vehicle caps are configured per plant and applied across grades.
Factory-specific rush-hour intervals from requirement page 12 are excluded from eligible receiving slots.

Shop users must acknowledge both current PDPA documents before booking; brokers/admins cannot accept on a shop's behalf. The demo records policy versions, user, and timestamp in browser local storage. The queue flow is intentionally limited to the gate pass; weighing/unloading system integration is out of scope.

The sidebar follows the earlier SYS navigation structure, with separate main workflow and data-management sections. Security accounts only see the dashboard, gate station, and queue lookup. The **เรียกรถ (รปภ.)** screen records the first-station queue scan and gate pass; **จัดการการจัดส่ง (ปศ.)** manages slot capacity, plant moves, and requests for security to call the driver.

Creating a delivery slip follows four non-clickable progress steps: delivery details and source weigh ticket, registered vehicle selection, approved driver selection, and successful save with the generated QR delivery slip.

## Project layout

- `app/types/queue.ts` — shared business types.
- `app/data/mock-data.ts` — typed demo users, plans, plants, drivers, and bookings.
- `app/components/` — reusable UI elements and separate views for login, overview, plans, booking, calling, and driver registry.
- `app/globals.css` — shared SYS Tailwind theme tokens and global styles.

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`QUEUE-REQUIREMENT-TESTS.md` contains requirement-aligned end-to-end scenarios. The automated rule tests cover scheduling, capacity, blacklist validation, and current-version PDPA acknowledgement.
