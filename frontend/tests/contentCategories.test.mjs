import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCategoryFilters,
  formatCategoryLabel,
  normalizeCategory,
} from "../src/utils/contentCategories.mjs";

test("normalizes a category entered by an admin", () => {
  assert.equal(normalizeCategory("  Behind The Scenes & More  "), "behind-the-scenes-and-more");
  assert.equal(formatCategoryLabel("behind-the-scenes-and-more"), "Behind The Scenes And More");
});

test("builds filters from categories that are actually in published content", () => {
  const filters = buildCategoryFilters(
    [
      { category: "live" },
      { category: "new-format" },
      { category: "live" },
      { category: "" },
    ],
    [
      { id: "all", label: "All" },
      { id: "studio", label: "Studio" },
      { id: "live", label: "Live Sets" },
    ],
  );

  assert.deepEqual(filters, [
    { id: "all", label: "All" },
    { id: "live", label: "Live Sets" },
    { id: "new-format", label: "New Format" },
  ]);
});

test("keeps an empty archive filterable without showing unused categories", () => {
  assert.deepEqual(buildCategoryFilters([], [{ id: "live", label: "Live" }]), [
    { id: "all", label: "All" },
  ]);
});
