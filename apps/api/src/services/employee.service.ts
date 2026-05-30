import type {
  CreateEmployeeInput,
  Employee,
  ListEmployeesQuery,
  Paginated,
  UpdateEmployeeInput,
} from "@salary/shared";
import { toUsdMinor } from "../domain/currency.js";
import { ConflictError, NotFoundError } from "../domain/errors.js";
import type {
  EmployeeRecord,
  EmployeeRepository,
} from "../repositories/employee.repository.js";

/** Maps a persisted record to the API DTO (Dates → ISO strings). */
function toDto(record: EmployeeRecord): Employee {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  } as Employee;
}

/**
 * Business logic for employees. Depends only on the EmployeeRepository
 * interface, so it is fully unit-testable with an in-memory fake.
 */
export class EmployeeService {
  constructor(private readonly repo: EmployeeRepository) {}

  async list(query: ListEmployeesQuery): Promise<Paginated<Employee>> {
    const { data, total } = await this.repo.list(query);
    return { data: data.map(toDto), total, page: query.page, pageSize: query.pageSize };
  }

  async get(id: string): Promise<Employee> {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundError(`Employee ${id} not found`);
    return toDto(record);
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    if (await this.repo.existsByEmail(input.email)) {
      throw new ConflictError(`An employee with email ${input.email} already exists`);
    }
    const created = await this.repo.create({
      ...input,
      baseSalaryUsdMinor: toUsdMinor(input.baseSalary, input.currency),
    });
    return toDto(created);
  }

  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Employee ${id} not found`);

    if (input.email && input.email !== existing.email) {
      if (await this.repo.existsByEmail(input.email, id)) {
        throw new ConflictError(`An employee with email ${input.email} already exists`);
      }
    }

    const patch: Partial<EmployeeRecord> = { ...input };
    // Keep the denormalized USD figure in sync when salary or currency changes.
    if (input.baseSalary !== undefined || input.currency !== undefined) {
      const baseSalary = input.baseSalary ?? existing.baseSalary;
      const currency = input.currency ?? existing.currency;
      patch.baseSalaryUsdMinor = toUsdMinor(baseSalary, currency);
    }

    const updated = await this.repo.update(id, patch);
    if (!updated) throw new NotFoundError(`Employee ${id} not found`);
    return toDto(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError(`Employee ${id} not found`);
  }
}
