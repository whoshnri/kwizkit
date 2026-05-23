"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { createTest } from "@/app/actions/testOps";
import { useSession } from "@/app/SessionContext";
import { Settings } from "@/lib/setting";

const defaultSettings: Settings = {
  general: {
    shuffleQuestions: false,
    shuffleOptions: false,
  },
  security: {
    enableTabSwitching: false,
    disableCopyPaste: false,
  },
  users: {
    usersAdded: false,
  },
  testTime: 0,
};

const initialFormState = {
  name: "",
  subject: "",
  subjectId: "",
  difficulty: "easy",
  visibility: false,
  description: "",
  assignedClassIds: [] as string[],
};

export function useNewTestForm({ onCreated }: { onCreated: () => void }) {
  const { session } = useSession();
  const [form, setForm] = useState(initialFormState);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function updateField(name: keyof typeof initialFormState, value: string | boolean | string[]) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim() || !form.subject.trim()) {
      setError("Test Name and Subject are required.");
      return;
    }

    if (!session?.id) {
      setError("Authentication error. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createTest({
        name: form.name,
        description: form.description || null,
        subject: form.subject,
        subjectId: form.subjectId || undefined,
        difficulty: form.difficulty as "easy" | "medium" | "hard",
        visibility: form.visibility,
        createdById: session.id,
        settings: defaultSettings,
        assignedClassIds: form.assignedClassIds,
      });

      if (!response.status || response.status !== 201) {
        toast.error(response.message || "An unexpected error occurred while creating the test.", {
          description: response.metadata as string,
        });
        return;
      }

      toast.success(response.message || "Test created successfully.");
      onCreated();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create test.");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    isLoading,
    error,
    handleChange,
    updateField,
    handleSubmit,
  };
}
