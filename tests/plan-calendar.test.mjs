import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  adjustKg,
  getMonthCells,
  isDateLocked,
  setDayDemand,
  shiftMonth,
  sumDayDemand,
} from "../app/data/plan-calendar.ts";

test("dates up to 7 days ahead and the past are locked", () => {
  const today = "2026-10-27";
  assert.equal(isDateLocked("2026-10-01", today), true);
  assert.equal(isDateLocked("2026-10-27", today), true);
  assert.equal(isDateLocked("2026-11-03", today), true);
  assert.equal(isDateLocked("2026-11-04", today), false);
});

test("month grid is whole weeks and starts on Sunday", () => {
  const cells = getMonthCells(2026, 9);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells.find((c) => c.inMonth)?.date, "2026-10-01");
  assert.equal(cells[0].date, "2026-09-27");
  assert.equal(cells.filter((c) => c.inMonth).length, 31);
});

test("shiftMonth wraps years", () => {
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("kg adjusts by step and never goes below zero", () => {
  assert.equal(adjustKg(100, 100), 200);
  assert.equal(adjustKg(0, -100), 0);
});

test("day demand sums across plants", () => {
  let demand = setDayDemand({}, "2026-11-10", "SYS1", { A: 100, B: 200 });
  demand = setDayDemand(demand, "2026-11-10", "SYS2", { A: 300 });
  assert.equal(sumDayDemand(demand, "2026-11-10"), 600);
  assert.equal(sumDayDemand(demand, "2026-11-11"), 0);
});
