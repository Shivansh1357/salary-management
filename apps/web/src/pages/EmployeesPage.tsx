import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  COUNTRIES,
  DEPARTMENTS,
  type Employee,
  EMPLOYEE_STATUSES,
  LEVELS,
} from "@salary/shared";
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { type EmployeesQuery, useDeleteEmployee, useEmployees } from "../api/employees.js";
import { EmployeeFormModal } from "../components/EmployeeFormModal.js";
import { EmployeeTableSkeleton } from "../components/EmployeeTableSkeleton.js";
import { countryName, employmentTypeLabel } from "../lib/labels.js";
import { formatMoney, formatUsdMinor } from "../lib/money.js";

const PAGE_SIZE = 25;

const SORT_COLUMNS = [
  { key: "lastName", label: "Name" },
  { key: "department", label: "Department" },
  { key: "level", label: "Level" },
  { key: "baseSalary", label: "Salary" },
  { key: "hireDate", label: "Hire date" },
] as const;

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [department, setDepartment] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>("active");
  const [sort, setSort] = useState<string>("lastName");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const query: EmployeesQuery = {
    search: debouncedSearch || undefined,
    department: department ?? undefined,
    country: country ?? undefined,
    level: level ?? undefined,
    status: status ?? undefined,
    sort,
    order,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, error, isFetching } = useEmployees(query);
  const deleteMutation = useDeleteEmployee();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const toggleSort = (key: string) => {
    if (sort === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setOrder("asc");
    }
    setPage(1);
  };

  const resetToFirstPage = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notifications.show({ message: "Employee deleted", color: "green" });
    } catch {
      notifications.show({ message: "Could not delete employee", color: "red" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Employees</Title>
          <Group gap="xs" h={22}>
            {data ? (
              <Text c="dimmed" size="sm">
                {data.total.toLocaleString()} matching employees
              </Text>
            ) : (
              <Skeleton height={12} width={160} />
            )}
            {isFetching && data && <Loader size="xs" />}
          </Group>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Add employee
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group align="flex-end" gap="sm">
          <TextInput
            label="Search"
            placeholder="Name or email"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={240}
          />
          <Select
            label="Department"
            placeholder="All"
            clearable
            data={[...DEPARTMENTS]}
            value={department}
            onChange={resetToFirstPage(setDepartment)}
            w={170}
          />
          <Select
            label="Country"
            placeholder="All"
            clearable
            data={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            value={country}
            onChange={resetToFirstPage(setCountry)}
            w={160}
          />
          <Select
            label="Level"
            placeholder="All"
            clearable
            data={[...LEVELS]}
            value={level}
            onChange={resetToFirstPage(setLevel)}
            w={110}
          />
          <Select
            label="Status"
            placeholder="All"
            clearable
            data={EMPLOYEE_STATUSES.map((s) => ({ value: s, label: s }))}
            value={status}
            onChange={resetToFirstPage(setStatus)}
            w={130}
          />
        </Group>
      </Paper>

      <Paper withBorder radius="md" pos="relative">
        {isError ? (
          <Alert color="red" icon={<IconAlertTriangle size={16} />} m="md">
            Could not load employees: {error instanceof Error ? error.message : "unknown error"}
          </Alert>
        ) : isLoading || !data ? (
          <EmployeeTableSkeleton />
        ) : data.data.length === 0 ? (
          <Center mih={240}>
            <Stack align="center" gap={4}>
              <IconUsersGroup size={36} opacity={0.4} />
              <Text fw={600}>No employees match these filters</Text>
              <Text c="dimmed" size="sm">
                Try clearing a filter or adjusting your search.
              </Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={760}>
            <Table highlightOnHover verticalSpacing="sm" striped>
              <Table.Thead>
                <Table.Tr>
                  {SORT_COLUMNS.map((col) => (
                    <Table.Th key={col.key}>
                      <UnstyledButton onClick={() => toggleSort(col.key)}>
                        <Group gap={4}>
                          <Text fw={600} size="sm">
                            {col.label}
                          </Text>
                          {sort === col.key &&
                            (order === "asc" ? (
                              <IconChevronUp size={14} />
                            ) : (
                              <IconChevronDown size={14} />
                            ))}
                        </Group>
                      </UnstyledButton>
                    </Table.Th>
                  ))}
                  <Table.Th>Country</Table.Th>
                  <Table.Th w={90} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.data.map((emp) => (
                  <Table.Tr key={emp.id}>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {emp.firstName} {emp.lastName}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {emp.jobTitle} · {emp.email}
                      </Text>
                      {emp.status === "inactive" && (
                        <Badge size="xs" color="gray" variant="light" mt={2}>
                          inactive
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>{emp.department}</Table.Td>
                    <Table.Td>
                      <Badge variant="light">{emp.level}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {formatMoney(emp.baseSalary, emp.currency)}
                      </Text>
                      <Text c="dimmed" size="xs">
                        ≈ {formatUsdMinor(emp.baseSalaryUsdMinor)}
                      </Text>
                    </Table.Td>
                    <Table.Td>{emp.hireDate}</Table.Td>
                    <Table.Td>{countryName(emp.country)}</Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <ActionIcon variant="subtle" onClick={() => openEdit(emp)} aria-label="Edit">
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => setDeleteTarget(emp)}
                          aria-label="Delete"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {data && data.total > PAGE_SIZE && (
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Page {page} of {totalPages}
          </Text>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}

      <EmployeeFormModal opened={formOpen} onClose={() => setFormOpen(false)} employee={editing} />

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete employee"
        size="sm"
      >
        <Text size="sm">
          Delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This cannot be
          undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" loading={deleteMutation.isPending} onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
