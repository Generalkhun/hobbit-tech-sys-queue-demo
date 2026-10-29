import test from "node:test";
import assert from "node:assert/strict";
import { getBlacklistReason, hasCurrentPolicyAcknowledgement } from "../app/data/eligibility.ts";
import { getAllowedPages } from "../app/data/access.ts";
import { canMoveBookingToPlant, schedulePlant } from "../app/data/scheduling.ts";
import {
  copyDateConfig,
  hasSameDateConfig,
  createCapacityResolver,
  emptyCapacityConfig,
  getSlotCapacities,
  setHourlyDefault,
  setSlotCapacities,
  setSlotClosure,
  splitEvenly,
  summarizeDay,
} from "../app/data/slot-capacity.ts";
import { getStatusTransitionError } from "../app/data/workflow.ts";

function plan(plantId, overrides = {}) {
  return {
    id: `${plantId}-bundle`,
    plantId,
    grade: "Bundle SY",
    dailyLimit: 100,
    reserved: 50,
    slotsOpen: 4,
    window: "08:00–16:00",
    maxVehiclesPerSlot: 2,
    ...overrides,
  };
}

function booking(id, plantId, overrides = {}) {
  return {
    id,
    retailer: "ร้านทดสอบ",
    broker: "—",
    plantId,
    grade: "Bundle SY",
    estimatedTons: 20,
    date: "2026-10-28",
    timeSlot: "09:00–10:00",
    driver: "คนขับทดสอบ",
    carrier: "ขนส่งทดสอบ",
    plate: `${id}-plate`,
    status: "confirmed",
    ticketName: "ticket.pdf",
    createdAt: "09:00",
    ...overrides,
  };
}

const request = {
  date: "2026-10-28",
  timeSlot: "09:00–10:00",
  grade: "Bundle SY",
  estimatedTons: 28,
};

test("driver role only has the three driver portal pages", () => {
  assert.deepEqual(getAllowedPages("driver"), [
    "driver-pass",
    "driver-checkin",
    "driver-queue",
  ]);
});

test("balances open slots before applying grade-shortage priority", () => {
  const result = schedulePlant(
    request,
    [
      plan("SYS1", { dailyLimit: 100, reserved: 80 }),
      plan("SYS2", { dailyLimit: 100, reserved: 40 }),
    ],
    [],
  );
  assert.equal(result.available, true);
  if (result.available) assert.equal(result.decision.plantId, "SYS2");
});

test("routes to the less-loaded factory when slot vehicle counts differ", () => {
  const result = schedulePlant(
    request,
    [plan("SYS1", { dailyLimit: 100, reserved: 0 }), plan("SYS2", { dailyLimit: 100, reserved: 100 })],
    [booking("B-1", "SYS1")],
  );
  assert.equal(result.available, true);
  if (result.available) assert.equal(result.decision.plantId, "SYS2");
});

test("counts only the same grade against a slot's per-grade vehicle limit", () => {
  const result = schedulePlant(
    request,
    [plan("SYS1", { maxVehiclesPerSlot: 1 }), plan("SYS2", { maxVehiclesPerSlot: 1 })],
    [booking("B-1", "SYS1", { grade: "Local O" })],
  );
  assert.equal(result.available, true);
  if (result.available) assert.equal(result.decision.plantId, "SYS1");
});

test("uses per-slot grade capacity overrides when scheduling", () => {
  const plans = [plan("SYS1", { maxVehiclesPerSlot: 2 })];
  const config = setSlotCapacities(
    emptyCapacityConfig,
    request.date,
    "SYS1",
    request.timeSlot,
    { "Bundle SY": 0 },
  );
  const result = schedulePlant(
    request,
    plans,
    [],
    createCapacityResolver(plans, config),
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /เต็มทุกโรงงาน/);
});

test("splits the hourly default evenly across open grades, remainder first", () => {
  assert.deepEqual(splitEvenly(10, 4), [3, 3, 2, 2]);
  assert.deepEqual(splitEvenly(8, 4), [2, 2, 2, 2]);
  const plans = ["A", "B", "C", "D"].map((grade) =>
    plan("SYS1", { id: grade, grade }),
  );
  const config = setHourlyDefault(emptyCapacityConfig, "2026-10-28", "SYS1", 8);
  assert.deepEqual(
    getSlotCapacities(config, plans, "2026-10-28", "SYS1", "10:00–11:00"),
    { A: 2, B: 2, C: 2, D: 2 },
  );
});

test("saves a plan per day without touching other days, and detects unsaved edits", () => {
  const draft = setHourlyDefault(
    setSlotCapacities(emptyCapacityConfig, "2026-10-28", "SYS1", "10:00–11:00", { "Bundle SY": 2 }),
    "2026-10-29",
    "SYS1",
    9,
  );
  assert.equal(hasSameDateConfig(draft, emptyCapacityConfig, "2026-10-28"), false);
  const saved = copyDateConfig(draft, emptyCapacityConfig, "2026-10-28");
  assert.equal(hasSameDateConfig(draft, saved, "2026-10-28"), true);
  assert.equal(hasSameDateConfig(draft, saved, "2026-10-29"), false);
  const reverted = copyDateConfig(saved, draft, "2026-10-28");
  assert.equal(hasSameDateConfig(reverted, saved, "2026-10-28"), true);
});

test("a manually closed slot blocks booking, is saved per day, and can be reopened", () => {
  const plans = [plan("SYS1")];
  const closed = setSlotClosure(emptyCapacityConfig, request.date, "SYS1", request.timeSlot, " ซ่อมเครื่องชั่ง ");
  assert.deepEqual(getSlotCapacities(closed, plans, request.date, "SYS1", request.timeSlot), {});
  assert.deepEqual(
    getSlotCapacities(closed, plans, request.date, "SYS1", request.timeSlot, { ignoreClosure: true }),
    { "Bundle SY": 2 },
  );
  const result = schedulePlant(request, plans, [], createCapacityResolver(plans, closed));
  assert.equal(result.available, false);
  assert.equal(hasSameDateConfig(closed, emptyCapacityConfig, request.date), false);
  const reopened = setSlotClosure(closed, request.date, "SYS1", request.timeSlot, null);
  assert.equal(hasSameDateConfig(reopened, emptyCapacityConfig, request.date), true);
});

test("closes rush-hour slots and summarizes the day in vehicles and kg", () => {
  const plans = ["A", "B"].map((grade) => plan("SYS1", { id: grade, grade }));
  const config = setHourlyDefault(emptyCapacityConfig, "2026-10-28", "SYS1", 4);
  assert.deepEqual(
    getSlotCapacities(config, plans, "2026-10-28", "SYS1", "08:00–09:00"),
    {},
  );
  const summary = summarizeDay(config, plans, "2026-10-28", "SYS1");
  assert.equal(summary.length, 2);
  for (const row of summary) {
    assert.equal(row.kilograms, row.vehicles * 20);
    assert.ok(row.vehicles > 0);
  }
});

test("rejects a slot when every planned factory has reached its vehicle cap", () => {
  const result = schedulePlant(
    request,
    [plan("SYS1", { maxVehiclesPerSlot: 1 }), plan("SYS2", { maxVehiclesPerSlot: 1 })],
    [booking("B-1", "SYS1"), booking("B-2", "SYS2")],
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /เต็มทุกโรงงาน/);
});

test("counts vehicles that already passed the gate against that slot's capacity", () => {
  const result = schedulePlant(
    request,
    [plan("SYS1", { maxVehiclesPerSlot: 1 }), plan("SYS2", { maxVehiclesPerSlot: 1 })],
    [
      booking("B-1", "SYS1", { status: "completed" }),
      booking("B-2", "SYS2", { status: "completed" }),
    ],
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /เต็มทุกโรงงาน/);
});

test("rejects a grade without a receiving plan", () => {
  const result = schedulePlant({ ...request, grade: "Unknown" }, [plan("SYS1")], []);
  assert.equal(result.available, false);
  assert.match(result.reason, /ไม่มีแผนรับเกรด/);
});

test("rejects a slot that overlaps the plant's rush-hour block", () => {
  const result = schedulePlant(
    { ...request, timeSlot: "08:00–09:00" },
    [plan("SYS1")],
    [],
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /rush hour/);
});

test("rejects invalid or zero-ton bookings", () => {
  for (const estimatedTons of [0, -1, Number.NaN]) {
    const result = schedulePlant(
      { ...request, estimatedTons },
      [plan("SYS1")],
      [],
    );
    assert.equal(result.available, false);
    assert.match(result.reason, /มากกว่าศูนย์/);
  }
});

test("allows moving a booking after excluding itself from the target slot count", () => {
  const current = booking("B-1", "SYS1");
  const result = canMoveBookingToPlant(
    current,
    "SYS2",
    [plan("SYS1"), plan("SYS2", { maxVehiclesPerSlot: 1 })],
    [current],
  );
  assert.equal(result.available, true);
  if (result.available) assert.equal(result.decision.plantId, "SYS2");
});

test("blocks a move into a full destination slot", () => {
  const current = booking("B-1", "SYS1");
  const result = canMoveBookingToPlant(
    current,
    "SYS2",
    [plan("SYS1"), plan("SYS2", { maxVehiclesPerSlot: 1 })],
    [current, booking("B-2", "SYS2")],
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /เต็มแล้ว/);
});

test("rejects a no-op move to the booking's current factory", () => {
  const current = booking("B-1", "SYS1");
  const result = canMoveBookingToPlant(
    current,
    "SYS1",
    [plan("SYS1"), plan("SYS2")],
    [current],
  );
  assert.equal(result.available, false);
  assert.match(result.reason, /อยู่ที่โรงงาน SYS1 อยู่แล้ว/);
});

test("rejects both blacklisted drivers and vehicles with a visible reason", () => {
  const blacklist = [
    { id: "BL-1", targetType: "driver", targetId: "D-1", reason: "driver review" },
    { id: "BL-2", targetType: "vehicle", targetId: "70-1111", reason: "vehicle review" },
  ];
  assert.deepEqual(getBlacklistReason("D-1", "70-2222", blacklist), ["driver review"]);
  assert.deepEqual(getBlacklistReason("D-2", "70-1111", blacklist), ["vehicle review"]);
  assert.deepEqual(getBlacklistReason("D-1", "70-1111", blacklist), [
    "driver review",
    "vehicle review",
  ]);
});

test("requires acknowledgement of both current policy documents", () => {
  const acknowledgements = [
    {
      shopName: "ร้านทดสอบ",
      documentType: "privacy-notice",
      policyVersion: "1.0",
    },
    {
      shopName: "ร้านทดสอบ",
      documentType: "personal-data-use",
      policyVersion: "1.0",
    },
  ];
  assert.equal(
    hasCurrentPolicyAcknowledgement("ร้านทดสอบ", "1.0", acknowledgements),
    true,
  );
  assert.equal(
    hasCurrentPolicyAcknowledgement("ร้านทดสอบ", "2.0", acknowledgements),
    false,
  );
  assert.equal(
    hasCurrentPolicyAcknowledgement("ร้านอื่น", "1.0", acknowledgements),
    false,
  );
});

test("enforces the confirmed QR-to-gate-pass status flow by role", () => {
  assert.equal(getStatusTransitionError("security", "confirmed", "at-gate"), null);
  assert.equal(getStatusTransitionError("operations", "at-gate", "call-requested"), null);
  assert.equal(getStatusTransitionError("security", "call-requested", "called"), null);
  assert.equal(getStatusTransitionError("security", "called", "completed"), null);
  assert.match(
    getStatusTransitionError("operations", "at-gate", "called"),
    /ลำดับคิว/,
  );
  assert.match(
    getStatusTransitionError("broker", "confirmed", "at-gate"),
    /ไม่มีสิทธิ์/,
  );
});
