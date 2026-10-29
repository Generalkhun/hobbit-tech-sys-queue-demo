import test from "node:test";
import assert from "node:assert/strict";
import {
  checkinRadiusKm,
  distanceInKm,
  isValidPhone,
  replacePrimaryPhone,
  validateContactPhones,
} from "../app/data/driver-checkin.ts";
import {
  computeBreakdownRows,
  computeOverviewMetrics,
  getGroupValue,
} from "../app/data/overview.ts";

const booking = (id, overrides = {}) => ({
  id,
  plantId: "SYS1",
  grade: "Local O",
  broker: "—",
  retailer: "ร้านA",
  date: "2026-01-01",
  estimatedTons: 2,
  ...overrides,
});
const plants = [{ id: "SYS1", name: "โรงงาน 1" }];

test("distanceInKm is zero for same point and symmetric", () => {
  assert.equal(distanceInKm(13.7, 100.5, 13.7, 100.5), 0);
  const a = distanceInKm(13.7, 100.5, 14.0, 100.9);
  assert.ok(Math.abs(a - distanceInKm(14.0, 100.9, 13.7, 100.5)) < 1e-9);
  assert.ok(a > checkinRadiusKm);
});

test("contact phone validation", () => {
  assert.ok(isValidPhone(" 0812345678 "));
  assert.ok(!isValidPhone("abc"));
  assert.match(validateContactPhones(["", " "]).error, /อย่างน้อย 1/);
  assert.match(validateContactPhones(["1", "2", "3", "4"].map(() => "0812345678")).error, /สูงสุด 3/);
  assert.match(validateContactPhones(["12"]).error, /ตรวจสอบ/);
  assert.deepEqual(validateContactPhones([" 0812345678 "]), {
    phones: ["0812345678"],
    error: "",
  });
  assert.deepEqual(replacePrimaryPhone([], "1"), ["1"]);
  assert.deepEqual(replacePrimaryPhone(["a", "b"], "1"), ["1", "b"]);
});

test("overview grouping and aggregation", () => {
  assert.equal(getGroupValue(booking("A"), "seller"), "ไม่ระบุผู้ขาย");
  const bookings = [
    booking("A"),
    booking("B", { date: "2025-12-31" }),
    booking("C"),
  ];
  const receipts = {
    A: { state: "received", receivedDate: "2026-01-01", receivedKg: 1800 },
    B: { state: "received", receivedDate: "2026-01-01", receivedKg: 500 },
    C: { state: "no-show", receivedDate: "", receivedKg: 0 },
  };
  const metrics = computeOverviewMetrics(bookings, receipts, plants, "2026-01-01", "all");
  assert.equal(metrics.bookedKg, 4000);
  assert.equal(metrics.receivedKg, 1800);
  assert.equal(metrics.noShowKg, 2000);
  assert.equal(metrics.lateKg, 500);
  assert.equal(metrics.plantSummary[0].bookedKg, 4000);
  const rows = computeBreakdownRows(metrics.visibleBookings, receipts, "2026-01-01", "grade");
  assert.deepEqual(rows, [
    ["Local O", { booked: 4000, received: 1800, noShow: 2000, late: 500 }],
  ]);
});
