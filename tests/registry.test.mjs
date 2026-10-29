import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStatusRows,
  createEmptyDriver,
  createEmptyVehicle,
  createStatusRecord,
  finalizeDriver,
  finalizeVehicle,
  getAvailableStatusAction,
  getDriverCompletionIssues,
  getDriverStepIssues,
  getVehicleCompletionIssues,
  getVehicleStepIssues,
  isDriverApproved,
  maskNationalId,
  nextRegistryId,
  paginate,
  saveDriverDraft,
} from "../app/data/registry.ts";

const completeDriver = {
  ...createEmptyDriver("D-100"),
  firstName: "สมศักดิ์",
  lastName: "ดีมาก",
  nationalId: "1234567890123",
  licenseNumber: "DL-1",
  phone: "081",
  carrier: "SYS",
  plate: "70-0001",
  photo: "blob:p",
  idCardImage: "blob:i",
  licenseImage: "blob:l",
};

test("driver steps require their own data only", () => {
  const empty = createEmptyDriver("D-1");
  assert.ok(getDriverStepIssues(empty, 0).length > 0);
  assert.deepEqual(getDriverStepIssues(completeDriver, 0), []);
  assert.deepEqual(getDriverStepIssues(empty, 1), ["ภาพถ่ายพนักงาน"]);
  assert.equal(getDriverStepIssues(empty, 2).length, 2);
  assert.deepEqual(getDriverCompletionIssues(completeDriver), []);
});

test("shop employee must pick a shop", () => {
  const issues = getDriverStepIssues({ ...completeDriver, employmentType: "employee" }, 0);
  assert.deepEqual(issues, ["เลือกร้านค้า"]);
});

test("draft saves keep step and finalize depends on role", () => {
  const draft = saveDriverDraft(completeDriver, 2);
  assert.equal(draft.status, "draft");
  assert.equal(draft.draftStep, 2);
  assert.equal(isDriverApproved(draft), false);
  assert.equal(finalizeDriver(completeDriver, true).status, "active");
  assert.equal(finalizeDriver(completeDriver, false).status, "pending");
  assert.equal(finalizeDriver(completeDriver, true).name, "สมศักดิ์ ดีมาก");
});

test("vehicle requires four photos and registration document", () => {
  const empty = createEmptyVehicle("V-1");
  assert.equal(getVehicleStepIssues(empty, 1).length, 4);
  assert.deepEqual(getVehicleStepIssues(empty, 2), ["เล่มทะเบียนรถ"]);
  const full = {
    ...empty,
    carrier: "SYS",
    vehicleType: "รถบรรทุก 6 ล้อ",
    plate: "70-1",
    province: "ปทุมธานี",
    chassisNumber: "C1",
    photos: { front: "a", back: "b", right: "c", left: "d" },
    registrationDocument: "e",
  };
  assert.deepEqual(getVehicleCompletionIssues(full), []);
  assert.equal(finalizeVehicle(full, false).status, "pending");
});

test("status actions follow the current status", () => {
  assert.equal(getAvailableStatusAction("draft"), null);
  assert.equal(getAvailableStatusAction("pending"), "approve");
  assert.equal(getAvailableStatusAction("active"), "suspend");
  assert.equal(getAvailableStatusAction("suspended"), "release");
});

test("status history rows are scoped and newest first", () => {
  const note = { note: "ตรวจแล้ว", attachments: [] };
  const a = createStatusRecord("D-1", "suspend", note, "admin", new Date("2026-01-01"));
  const b = createStatusRecord("D-1", "release", note, "admin", new Date("2026-02-01"));
  const other = createStatusRecord("D-2", "suspend", note, "admin");
  const rows = buildStatusRows([a, other, b], "D-1");
  assert.deepEqual(rows.map((row) => row.action), ["ปลดการระงับ", "ระงับ"]);
});

test("helpers: ids, masking, pagination", () => {
  assert.equal(nextRegistryId("D", ["D-001", "D-009"]), "D-010");
  assert.equal(maskNationalId("1234567890123"), "1-XXXX-XXXXX-XX-3");
  const page = paginate([1, 2, 3, 4, 5], 9, 2);
  assert.deepEqual(page, { pageCount: 3, currentPage: 3, items: [5] });
});
