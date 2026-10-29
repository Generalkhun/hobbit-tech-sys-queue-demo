# Queue requirement test cases

These scenarios capture the confirmed business rules for the current demo. Automated rule tests run with `npm test`; the remaining cases are end-to-end UI checks.

## Scheduling and slot capacity

| ID | Scenario | Expected result |
|---|---|---|
| SCH-01 | Both plants have capacity in the selected slot and the same number of assigned vehicles; one grade has a larger unfilled target. | Assign to the plant with the larger shortage. Show both slot occupancy and grade-shortage reasoning. |
| SCH-02 | Both plants have capacity, but one has fewer assigned vehicles in the selected slot. | Assign to the less-loaded plant before applying grade-shortage priority. |
| SCH-03 | A plant reaches its configured maximum vehicles for the selected slot. | Do not assign another booking to that plant for the slot. |
| SCH-04 | All plants with a plan for the selected grade are full for the selected slot. | Reject creation, show that the slot is full, and allow another slot to be selected. |
| SCH-05 | The requested grade has no plan at either plant. | Reject creation and explain that no receiving plan exists. |
| SCH-06 | The slot is evenly loaded; incoming tonnage is larger than one plant's remaining grade target but not the other's. | Prefer the plant where the booking can satisfy more of the shortage; display the comparison in the scheduling explanation. |
| SCH-07 | A booking is moved by ปศ. to a factory whose same-time slot is at capacity. | Reject the move without changing the existing plant assignment. |
| SCH-08 | ปศ. moves a booking to another plant with capacity and a plan for its grade. | Update the plant assignment, retain date/time/grade/quantity, and record that it was moved by ปศ. |
| SCH-09 | A booking is moved while counting its current assignment. | Exclude the booking itself from the destination occupancy check. |
| SCH-10 | A booking requests zero, negative, or invalid tonnage. | Reject before assignment or capacity counters are changed. |
| SCH-11 | A one-hour slot overlaps a factory's rush-hour block from page 12. | Exclude that factory from scheduling and explain the rush-hour restriction. |

## Blacklist and delivery-note eligibility

| ID | Scenario | Expected result |
|---|---|---|
| BL-01 | Select a blacklisted driver. | Show the blacklist reason and prevent delivery-note creation. |
| BL-02 | Select a blacklisted vehicle. | Show the blacklist reason and prevent delivery-note creation. |
| BL-03 | Select a driver and vehicle that are both blacklisted. | Show both reasons and prevent delivery-note creation. |
| BL-04 | Select an approved driver and vehicle absent from the mock blacklist. | Continue the four-step delivery-note flow normally. |
| BL-05 | The selected slot becomes full before final save. | Recheck capacity at save and reject rather than creating an over-capacity booking. |

## PDPA acknowledgements

| ID | Scenario | Expected result |
|---|---|---|
| PDPA-01 | A shop with no current acknowledgement signs in and opens booking. | Require that shop user to acknowledge both the privacy notice and personal-data-use policy. |
| PDPA-02 | The shop user accepts both current policy documents. | Record one acknowledgement per document, including policy version, actor, and timestamp; allow booking. |
| PDPA-03 | A broker selects a shop that has not accepted both current documents. | Do not allow the broker to accept on the shop's behalf or create its delivery note. |
| PDPA-04 | The policy version changes after acknowledgement. | Treat the old acknowledgement as stale and require acknowledgement of the current version. |
| PDPA-05 | A shop has acknowledged both current documents. | The shop and authorized broker can create a delivery note for it. |

## Roles and queue flow

| ID | Scenario | Expected result |
|---|---|---|
| ROLE-01 | จศ. signs in. | Can view booking totals and access all demo functions. |
| ROLE-02 | ปศ. signs in. | Can edit receiving-plan slot capacities, call queues, and move bookings between plants subject to capacity. |
| ROLE-03 | Security signs in. | Can scan/verify the delivery pass at the first station; cannot book or move plant assignments. |
| FLOW-01 | Security verifies a delivery pass. | Booking enters the waiting-for-operations queue. |
| FLOW-02 | ปศ. calls a vehicle. | Booking changes to called; security remains responsible for calling the driver by the established phone workflow. |
| FLOW-03 | Queue flow ends at the gate pass. | Demo does not model weighing or unloading completion; it does not claim integration with downstream weighing systems. |
