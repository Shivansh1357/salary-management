import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  COUNTRIES,
  CURRENCIES,
  DEPARTMENTS,
  type Employee,
  EMPLOYMENT_TYPES,
  LEVELS,
} from "@salary/shared";
import { useEffect } from "react";
import { ApiError } from "../api/client.js";
import { useCreateEmployee, useUpdateEmployee } from "../api/employees.js";
import { EMPLOYMENT_TYPE_LABELS } from "../lib/labels.js";
import { majorToMinor, minorToMajor } from "../lib/money.js";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  level: string;
  country: string;
  currency: string;
  baseSalaryMajor: number | "";
  employmentType: string;
  hireDate: string;
  status: string;
}

const emptyValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  department: "Engineering",
  jobTitle: "",
  level: "L3",
  country: "US",
  currency: "USD",
  baseSalaryMajor: "",
  employmentType: "full_time",
  hireDate: "2024-01-01",
  status: "active",
};

const required = (label: string) => (value: string) =>
  value.trim().length > 0 ? null : `${label} is required`;

export interface EmployeeFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** When set, the form edits this employee; otherwise it creates a new one. */
  employee?: Employee | null;
}

export function EmployeeFormModal({ opened, onClose, employee }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: emptyValues,
    validate: {
      firstName: required("First name"),
      lastName: required("Last name"),
      email: (v) =>
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "A valid email is required",
      jobTitle: required("Job title"),
      baseSalaryMajor: (v) =>
        typeof v === "number" && v > 0 ? null : "Salary must be greater than 0",
    },
  });

  // Reset the form whenever the modal opens for a different employee.
  useEffect(() => {
    if (!opened) return;
    if (employee) {
      form.setValues({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle,
        level: employee.level,
        country: employee.country,
        currency: employee.currency,
        baseSalaryMajor: minorToMajor(employee.baseSalary, employee.currency),
        employmentType: employee.employmentType,
        hireDate: employee.hireDate,
        status: employee.status,
      });
    } else {
      form.setValues(emptyValues);
    }
    form.resetDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, employee]);

  const handleSubmit = form.onSubmit(async (values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      department: values.department,
      jobTitle: values.jobTitle,
      level: values.level,
      country: values.country,
      currency: values.currency,
      baseSalary: majorToMinor(Number(values.baseSalaryMajor), values.currency),
      employmentType: values.employmentType,
      hireDate: values.hireDate,
      status: values.status,
    } as Parameters<ReturnType<typeof useCreateEmployee>["mutateAsync"]>[0];

    try {
      if (employee) {
        await updateMutation.mutateAsync({ id: employee.id, input: payload });
        notifications.show({ message: "Employee updated", color: "green" });
      } else {
        await createMutation.mutateAsync(payload);
        notifications.show({ message: "Employee added", color: "green" });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        form.setFieldError("email", err.message);
        return;
      }
      notifications.show({
        message: err instanceof Error ? err.message : "Something went wrong",
        color: "red",
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Edit employee" : "Add employee"} size="lg">
      <form onSubmit={handleSubmit}>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="First name" withAsterisk {...form.getInputProps("firstName")} />
          <TextInput label="Last name" withAsterisk {...form.getInputProps("lastName")} />
          <TextInput label="Email" withAsterisk {...form.getInputProps("email")} />
          <TextInput label="Job title" withAsterisk {...form.getInputProps("jobTitle")} />
          <Select label="Department" data={[...DEPARTMENTS]} {...form.getInputProps("department")} />
          <Select label="Level" data={[...LEVELS]} {...form.getInputProps("level")} />
          <Select
            label="Country"
            data={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            {...form.getInputProps("country")}
            onChange={(value) => {
              if (!value) return;
              form.setFieldValue("country", value);
              const currency = COUNTRIES.find((c) => c.code === value)?.currency;
              if (currency) form.setFieldValue("currency", currency);
            }}
          />
          <Select label="Currency" data={[...CURRENCIES]} {...form.getInputProps("currency")} />
          <NumberInput
            label="Annual base salary"
            withAsterisk
            min={0}
            thousandSeparator=","
            {...form.getInputProps("baseSalaryMajor")}
          />
          <Select
            label="Employment type"
            data={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: EMPLOYMENT_TYPE_LABELS[t] ?? t }))}
            {...form.getInputProps("employmentType")}
          />
          <TextInput label="Hire date" type="date" {...form.getInputProps("hireDate")} />
          <Select
            label="Status"
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            {...form.getInputProps("status")}
          />
        </SimpleGrid>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? "Save changes" : "Add employee"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
