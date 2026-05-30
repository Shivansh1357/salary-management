import { BarChart } from "@mantine/charts";
import {
  Alert,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import type { HistogramBucket } from "@salary/shared";
import {
  IconAlertTriangle,
  IconCoin,
  IconScale,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useAnalytics } from "../api/analytics.js";
import { StatCard } from "../components/StatCard.js";
import { countryName } from "../lib/labels.js";
import { formatUsdMinor, formatUsdMinorCompact } from "../lib/money.js";

function bucketLabel(b: HistogramBucket): string {
  const k = (n: number) => `$${Math.round(n / 100 / 1000)}k`;
  if (b.toUsdMinor === null) return `${k(b.fromUsdMinor)}+`;
  if (b.fromUsdMinor === 0) return `< ${k(b.toUsdMinor)}`;
  return `${k(b.fromUsdMinor)}–${k(b.toUsdMinor)}`;
}

export function AnalyticsPage() {
  const { data, isLoading, isError, error } = useAnalytics();

  if (isError) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={16} />}>
        Could not load analytics: {error instanceof Error ? error.message : "unknown error"}
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <Stack gap="md">
        <Title order={2}>Pay analytics</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={110} radius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height={320} radius="md" />
      </Stack>
    );
  }

  const usd = (minor: number) => minor / 100;
  const deptData = [...data.byDepartment]
    .sort((a, b) => b.averageSalaryUsdMinor - a.averageSalaryUsdMinor)
    .map((g) => ({ group: g.key, "Average salary": usd(g.averageSalaryUsdMinor) }));
  const levelData = [...data.byLevel]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((g) => ({ group: g.key, "Average salary": usd(g.averageSalaryUsdMinor) }));
  const distData = data.distribution.map((b) => ({
    band: bucketLabel(b),
    Employees: b.count,
  }));
  const byCountry = [...data.byCountry].sort(
    (a, b) => b.averageSalaryUsdMinor - a.averageSalaryUsdMinor,
  );

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Pay analytics</Title>
        <Text c="dimmed" size="sm">
          How ACME pays people. All figures normalized to USD using indicative
          rates — directional, not accounting-grade.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Active headcount"
          value={data.headcount.toLocaleString()}
          icon={<IconUsers size={22} />}
        />
        <StatCard
          label="Total annual payroll"
          value={formatUsdMinorCompact(data.totalPayrollUsdMinor)}
          hint={formatUsdMinor(data.totalPayrollUsdMinor)}
          icon={<IconCoin size={22} />}
        />
        <StatCard
          label="Average salary"
          value={formatUsdMinor(data.averageSalaryUsdMinor)}
          icon={<IconTrendingUp size={22} />}
        />
        <StatCard
          label="Median salary"
          value={formatUsdMinor(data.medianSalaryUsdMinor)}
          icon={<IconScale size={22} />}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="md" padding="lg">
          <Text fw={600} mb="md">
            Average salary by department
          </Text>
          <BarChart
            h={300}
            data={deptData}
            dataKey="group"
            series={[{ name: "Average salary", color: "indigo.6" }]}
            valueFormatter={(v) => formatUsdMinorCompact(v * 100)}
            tickLine="y"
          />
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Text fw={600} mb="md">
            Average salary by level
          </Text>
          <BarChart
            h={300}
            data={levelData}
            dataKey="group"
            series={[{ name: "Average salary", color: "teal.6" }]}
            valueFormatter={(v) => formatUsdMinorCompact(v * 100)}
            tickLine="y"
          />
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="md">
          Salary distribution (USD)
        </Text>
        <BarChart
          h={280}
          data={distData}
          dataKey="band"
          series={[{ name: "Employees", color: "grape.6" }]}
          tickLine="y"
        />
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="md">
          By country
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Country</Table.Th>
              <Table.Th>Headcount</Table.Th>
              <Table.Th>Average salary</Table.Th>
              <Table.Th>Total payroll</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {byCountry.map((g) => (
              <Table.Tr key={g.key}>
                <Table.Td>{countryName(g.key)}</Table.Td>
                <Table.Td>{g.headcount.toLocaleString()}</Table.Td>
                <Table.Td>{formatUsdMinor(g.averageSalaryUsdMinor)}</Table.Td>
                <Table.Td>{formatUsdMinorCompact(g.totalSalaryUsdMinor)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
