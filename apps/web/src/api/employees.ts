import type {
  CreateEmployeeInput,
  Employee,
  Paginated,
  UpdateEmployeeInput,
} from "@salary/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client.js";

/** UI-side list parameters; mirrors the API's list query. */
export interface EmployeesQuery {
  search?: string;
  department?: string;
  country?: string;
  level?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function toQueryString(params: EmployeesQuery): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useEmployees(params: EmployeesQuery) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => apiFetch<Paginated<Employee>>(`/api/employees${toQueryString(params)}`),
    placeholderData: (prev) => prev, // keep previous page visible while fetching
  });
}

/** Invalidate every employee list query and the analytics summary. */
function useInvalidateEmployees() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["employees"] });
    void qc.invalidateQueries({ queryKey: ["analytics"] });
  };
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) =>
      apiFetch<Employee>("/api/employees", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      apiFetch<Employee>(`/api/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useDeleteEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/employees/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
