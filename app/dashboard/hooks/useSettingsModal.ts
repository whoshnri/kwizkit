"use client";

import { FormEvent, useEffect, useState } from "react";
import { fetchSettings } from "@/app/actions/fetchSettings";
import { saveSettings } from "@/app/actions/saveSettings";
import { Settings } from "@/lib/setting";

const fallbackSettings: Settings = {
  general: {
    shuffleQuestions: false,
    shuffleOptions: false,
  },
  security: {
    enableTabSwitching: true,
    disableCopyPaste: false,
  },
  users: {
    usersAdded: false,
  },
  testTime: 200,
};

export function useSettingsModal({
  testId,
  onClose,
}: {
  testId: string;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      if (!testId) return;

      try {
        const bundle = await fetchSettings(testId);
        if (!active) return;

        setSettings((previous) => ({
          ...previous,
          ...(bundle.settings as unknown as Settings),
        }));
      } catch (error) {
        console.error("Failed to fetch settings", error);
        if (!active) return;

        setSettings((previous) => ({
          ...previous,
          users: {
            ...previous.users,
            usersAdded: false,
          },
        }));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, [testId]);

  function updateSetting(
    section: "general" | "security",
    key: string,
    value: boolean
  ) {
    setSettings((previous) => ({
      ...previous,
      [section]: { ...previous[section], [key]: value },
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await saveSettings(testId, settings);
      if ("error" in result) {
        console.error("Failed to save settings:", result.error);
      }
    } catch (error) {
      console.error(
        "Unexpected error:",
        error instanceof Error ? error.message : error
      );
    } finally {
      setSaving(false);
      onClose();
    }
  }

  return {
    settings,
    saving,
    loading,
    updateSetting,
    handleSubmit,
  };
}
