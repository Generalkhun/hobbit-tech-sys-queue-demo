import type { Plant } from "@/app/types/queue";

export const plants: Plant[] = [
  {
    id: "SYS1",
    name: "SYS 1",
    location: "อ.บางปะอิน · อยุธยา",
    dailyCapacity: 340,
    reservedTons: 276,
    activeQueues: 12,
    latitude: 14.1911,
    longitude: 100.5771,
  },
  {
    id: "SYS2",
    name: "SYS 2",
    location: "อ.วังน้อย · อยุธยา",
    dailyCapacity: 280,
    reservedTons: 192,
    activeQueues: 8,
    latitude: 14.2267,
    longitude: 100.7163,
  },
];
