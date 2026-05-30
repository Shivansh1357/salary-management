import type { AnalyticsSummary } from "@salary/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client.js";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiFetch<AnalyticsSummary>("/api/analytics/summary"),
  });
}
