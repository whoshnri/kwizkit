"use client";

import React, { useState } from "react";
import { useSession } from "@/app/SessionContext";
import Modal from "./Modal";
import FormField from "./FormFields";
import { Loader2 } from "lucide-react";
import { createTest } from "@/app/actions/testOps";
import { Settings } from "@/lib/setting";
import { toast } from "sonner";

type NewTestProps = {
  setNewTest: (isOpen: boolean) => void;
};

const initialFormState = {
  name: "",
  subject: "",
  difficulty: "easy",
  visibility: false,
  description: "",
};

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

export default function NewTest({ setNewTest }: NewTestProps) {
  const { session } = useSession();
  const [form, setForm] = useState(initialFormState);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        difficulty: form.difficulty as "easy" | "medium" | "hard",
        visibility: form.visibility,
        createdById: session.id,
        settings: defaultSettings, 
      });

      if (!response.status || response.status !== 201) {
        toast.error(
          response.message || "An unexpected error occurred while creating the test.",
          {
            description: response.metadata as string,
          }
        );
        return;
      }
      toast.success(
        response.message || "Test created successfully."
      );
      setNewTest(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create New Test" onClose={() => setNewTest(false)}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-4">
          {error && (
            <div className="p-3 theme-danger-bg border border-dashed theme-danger-border-color rounded-lg">
              <p className="theme-danger-text text-sm">{error}</p>
            </div>
          )}

          <FormField
            label="Test Name"
            name="name"
            placeholder="e.g., Chapter 5: Algebra Basics"
            value={form.name}
            onChange={handleChange}
            required
          />

          <FormField
            label="Subject"
            name="subject"
            placeholder="e.g., Mathematics"
            value={form.subject}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Difficulty"
              name="difficulty"
              type="select"
              value={form.difficulty}
              onChange={handleChange}
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
            <FormField
              label="Visibility"
              name="visibility"
              value={form.visibility ? "Public" : "Private"}
              onChange={() => {}} // This is a no-op as the field is disabled
              disabled
              helpText="(Editable later)"
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            placeholder="A brief summary of what this test covers (optional)"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Footer */}
        <div className="pt-6 mt-auto flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setNewTest(false)}
            className="theme-button-secondary py-3 px-6"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="theme-button-primary py-3 px-6"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
            {isLoading ? "Creating..." : "Create Test"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
