import { AppShell, Group, NavLink, Text, ThemeIcon, Title } from "@mantine/core";
import { IconChartHistogram, IconCoin, IconUsers } from "@tabler/icons-react";
import { NavLink as RouterNavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import { EmployeesPage } from "./pages/EmployeesPage.js";

const NAV = [
  { to: "/employees", label: "Employees", icon: IconUsers },
  { to: "/analytics", label: "Pay analytics", icon: IconChartHistogram },
];

export function App() {
  const location = useLocation();
  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 240, breakpoint: "sm" }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <ThemeIcon variant="light" size="lg" radius="md">
            <IconCoin size={20} />
          </ThemeIcon>
          <Title order={4}>ACME Salary Management</Title>
          <Text c="dimmed" size="sm" visibleFrom="sm">
            HR console
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            component={RouterNavLink}
            to={to}
            label={label}
            leftSection={<Icon size={18} />}
            active={location.pathname.startsWith(to)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
