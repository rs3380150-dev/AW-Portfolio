export const normalizeCategory = (value = "") => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export const formatCategoryLabel = (value = "") => normalizeCategory(value)
  .split("-")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export const buildCategoryFilters = (items = [], preferredFilters = []) => {
  const presentCategories = new Set(
    items
      .map((item) => normalizeCategory(item?.category))
      .filter(Boolean),
  );
  const preferredLabels = new Map(
    preferredFilters
      .map((filter) => [normalizeCategory(filter?.id), filter?.label])
      .filter(([id]) => id && id !== "all"),
  );
  const orderedCategories = [];

  preferredFilters.forEach((filter) => {
    const id = normalizeCategory(filter?.id);
    if (id && id !== "all" && presentCategories.has(id) && !orderedCategories.includes(id)) {
      orderedCategories.push(id);
    }
  });
  presentCategories.forEach((id) => {
    if (!orderedCategories.includes(id)) orderedCategories.push(id);
  });

  return [
    { id: "all", label: "All" },
    ...orderedCategories.map((id) => ({
      id,
      label: preferredLabels.get(id) || formatCategoryLabel(id),
    })),
  ];
};
