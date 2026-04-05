export const DEV_TEST_PANEL_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEV_TEST_PANEL === "true" ||
  process.env.NODE_ENV !== "production";
