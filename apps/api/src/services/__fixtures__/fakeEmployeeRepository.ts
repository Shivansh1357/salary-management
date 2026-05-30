import type { ListEmployeesQuery } from "@salary/shared";
import type {
  EmployeeRecord,
  EmployeeRepository,
  NewEmployeeRecord,
} from "../../repositories/employee.repository.js";

/**
 * In-memory EmployeeRepository for service unit tests. It honestly implements
 * the contract (id assignment, timestamps, email uniqueness) so service tests
 * assert real behavior rather than mock call-counts. Deterministic ids/dates.
 */
export function createFakeEmployeeRepository(seed: EmployeeRecord[] = []): EmployeeRepository {
  const store = new Map<string, EmployeeRecord>(seed.map((r) => [r.id, r]));
  let counter = seed.length;
  const fixedDate = new Date("2026-01-01T00:00:00.000Z");

  return {
    async create(data: NewEmployeeRecord): Promise<EmployeeRecord> {
      counter += 1;
      const record: EmployeeRecord = {
        ...data,
        id: `emp-${counter}`,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      };
      store.set(record.id, record);
      return record;
    },

    async findById(id: string): Promise<EmployeeRecord | null> {
      return store.get(id) ?? null;
    },

    async list(query: ListEmployeesQuery): Promise<{ data: EmployeeRecord[]; total: number }> {
      const all = [...store.values()];
      const start = (query.page - 1) * query.pageSize;
      return { data: all.slice(start, start + query.pageSize), total: all.length };
    },

    async update(id: string, data: Partial<NewEmployeeRecord>): Promise<EmployeeRecord | null> {
      const existing = store.get(id);
      if (!existing) return null;
      const updated: EmployeeRecord = { ...existing, ...data, updatedAt: fixedDate };
      store.set(id, updated);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      return store.delete(id);
    },

    async existsByEmail(email: string, exceptId?: string): Promise<boolean> {
      for (const record of store.values()) {
        if (record.email === email && record.id !== exceptId) return true;
      }
      return false;
    },
  };
}
