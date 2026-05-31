import { Skeleton, Table } from "@mantine/core";

const COLUMNS = ["Name", "Department", "Level", "Salary", "Hire date", "Country"];

/**
 * Placeholder table shown on first load: real column headers with skeleton
 * cells, so the layout doesn't jump when data arrives.
 */
export function EmployeeTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <Table.ScrollContainer minWidth={760}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            {COLUMNS.map((col) => (
              <Table.Th key={col}>{col}</Table.Th>
            ))}
            <Table.Th w={90} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <Table.Tr key={i} data-testid="employee-skeleton-row">
              <Table.Td>
                <Skeleton height={12} width="55%" mb={6} />
                <Skeleton height={9} width="80%" />
              </Table.Td>
              <Table.Td><Skeleton height={12} width="70%" /></Table.Td>
              <Table.Td><Skeleton height={20} width={32} radius="sm" /></Table.Td>
              <Table.Td>
                <Skeleton height={12} width="60%" mb={6} />
                <Skeleton height={9} width="45%" />
              </Table.Td>
              <Table.Td><Skeleton height={12} width="70%" /></Table.Td>
              <Table.Td><Skeleton height={12} width="65%" /></Table.Td>
              <Table.Td><Skeleton height={20} width={60} /></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
