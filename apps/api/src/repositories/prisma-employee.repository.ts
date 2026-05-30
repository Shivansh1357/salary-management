import type { Prisma, PrismaClient } from "@prisma/client";
import type { ListEmployeesQuery } from "@salary/shared";
import type {
  EmployeeRecord,
  EmployeeRepository,
  NewEmployeeRecord,
} from "./employee.repository.js";

/** Builds the Prisma `where` filter from a validated list query. */
function buildWhere(query: ListEmployeesQuery): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};
  if (query.department) where.department = query.department;
  if (query.country) where.country = query.country;
  if (query.level) where.level = query.level;
  if (query.status) where.status = query.status;
  if (query.search) {
    // SQLite LIKE is case-insensitive for ASCII, which covers names/emails.
    where.OR = [
      { firstName: { contains: query.search } },
      { lastName: { contains: query.search } },
      { email: { contains: query.search } },
    ];
  }
  return where;
}

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: NewEmployeeRecord): Promise<EmployeeRecord> {
    return this.prisma.employee.create({ data });
  }

  findById(id: string): Promise<EmployeeRecord | null> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  async list(query: ListEmployeesQuery): Promise<{ data: EmployeeRecord[]; total: number }> {
    const where = buildWhere(query);
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy: { [query.sort]: query.order },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Partial<NewEmployeeRecord>): Promise<EmployeeRecord | null> {
    try {
      return await this.prisma.employee.update({ where: { id }, data });
    } catch {
      // Prisma throws P2025 when the row does not exist.
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.employee.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async existsByEmail(email: string, exceptId?: string): Promise<boolean> {
    const found = await this.prisma.employee.findFirst({
      where: { email, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return found !== null;
  }
}
