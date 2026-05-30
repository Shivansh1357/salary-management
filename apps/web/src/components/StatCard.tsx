import { Card, Group, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text size="1.6rem" fw={700} mt={4}>
            {value}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={2}>
              {hint}
            </Text>
          )}
        </div>
        <ThemeIcon variant="light" size={40} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
