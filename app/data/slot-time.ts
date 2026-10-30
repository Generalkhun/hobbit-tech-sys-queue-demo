export const FIRST_SLOT_HOUR = 0;
export const LAST_SLOT_HOUR = 23;
export const FIRST_BOOKABLE_HOUR = 8;

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function pad(hour: number) {
  return String(hour).padStart(2, "0");
}

export function formatHour(hour: number) {
  return `${pad(hour)}:00`;
}

export function formatSlot(hour: number) {
  return `${formatHour(hour)}–${formatHour(hour + 1)}`;
}

export function getSlotStart(slot: string) {
  return slot.split(/[–-]/)[0] ?? "";
}

export const slotHours = Array.from(
  { length: LAST_SLOT_HOUR - FIRST_SLOT_HOUR + 1 },
  (_, index) => FIRST_SLOT_HOUR + index,
);

export const bookableSlots = slotHours
  .filter((hour) => hour >= FIRST_BOOKABLE_HOUR)
  .map(formatSlot);

export function isSlotInsideWindow(slot: string, window: string) {
  const [slotStart, slotEnd] = slot.split(/[–-]/);
  const [windowStart, windowEnd] = window.split(/[–-]/);
  if (!slotStart || !slotEnd || !windowStart || !windowEnd) return false;
  return (
    toMinutes(slotStart) >= toMinutes(windowStart) &&
    toMinutes(slotEnd) <= toMinutes(windowEnd)
  );
}

export function overlapsRushHour(plantId: string, slot: string) {
  const [slotStart, slotEnd] = slot.split(/[–-]/);
  if (!slotStart || !slotEnd) return false;
  const start = toMinutes(slotStart);
  const end = toMinutes(slotEnd);
  const rushHours =
    plantId === "SYS1"
      ? [
          ["07:00", "08:30"],
          ["16:30", "18:00"],
        ]
      : [
          ["07:00", "08:00"],
          ["16:30", "17:30"],
        ];
  return rushHours.some(
    ([rushStart, rushEnd]) =>
      start < toMinutes(rushEnd) && end > toMinutes(rushStart),
  );
}
