import { createTheme } from "@mantine/core";

/** A calm, professional theme for an HR tool: indigo accent, generous radius. */
export const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontWeight: "650",
  },
});
