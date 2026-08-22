import test from "node:test";
import assert from "node:assert/strict";
import { formatEventDate } from "../src/utils/formatEventDate.mjs";

test("formats an event date without timezone conversion", () => {
  assert.deepEqual(formatEventDate("2026-09-12"), {
    day: "12",
    mon: "SEP",
    year: 2026,
  });
});

test("supports dates close to a year boundary", () => {
  assert.deepEqual(formatEventDate("2026-01-01"), {
    day: "01",
    mon: "JAN",
    year: 2026,
  });
});

test("rejects malformed dates", () => {
  assert.throws(() => formatEventDate("12-09-2026"), /Invalid event date/);
  assert.throws(() => formatEventDate("2026-13-12"), /Invalid event date/);
});
