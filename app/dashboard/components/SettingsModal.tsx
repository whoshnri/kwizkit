"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, File, Save } from "lucide-react";
import { Switch } from "@headlessui/react";
import { saveSettings } from "@/app/actions/saveSettings";
import { fetchSettings } from "@/app/actions/fetchSettings";
import { Settings } from "@/lib/setting";

interface SettingsProps {
  testId: string;
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingSwitch = ({
  section,
  keyName,
  value,
  onChange,
}: {
  section: "general" | "security";
  keyName: string;
  value: boolean;
  onChange: (
    section: "general" | "security",
    key: string,
    value: boolean
  ) => void;
}) => {
  return (
    <Switch
      checked={value}
      onChange={(checked) => onChange(section, keyName, checked)}
      className={`${
        value ? "bg-blue-600" : "bg-gray-300"
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none `}
    >
      <span
        className={`${
          value ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  );
};

const SettingsModal = ({ testId, setShowSettingsModal }: SettingsProps) => {
  const [settings, setSettings] = useState<Settings>({
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
  });

  const [published, setPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSettingsAndUsers = async () => {
      if (!testId) return;

      try {
        const bundle = await fetchSettings(testId);
        const { settings, visibility } = bundle;

        const data = settings as Settings;

        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
        setPublished(visibility || false);
      } catch (err) {
        console.error("Failed to fetch settings", err);
        setSettings((prev) => ({
          ...prev,
          users: {
            ...prev.users,
            usersAdded: false,
          },
        }));
      } finally {
        setLoading(false);
      }
    };

    loadSettingsAndUsers();
  }, [testId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveSettings(testId, settings, published);
      if ("error" in result) {
        console.error("Failed to save settings:", result.error);
      }
    } catch (err: any) {
      console.error("Unexpected error:", err.message);
    } finally {
      setSaving(false);
      setShowSettingsModal(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center theme-bg-subtle">
        <div className="theme-bg rounded shadow-lg w-full max-w-2xl h-[80vh] flex items-center justify-center">
          <span className="loading loading-bars loading-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="theme-bg theme-text rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold ">Test Settings</h2>
            <button
              onClick={() => setShowSettingsModal(false)}
              type="button"
              className="p-2 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-md font-semibold mb-2">General Settings</h3>
            <div className="space-y-2">
              {Object.entries(settings.general).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <SettingSwitch
                    section="general"
                    keyName={key}
                    value={value}
                    onChange={(section, key, val) =>
                      setSettings((prev) => ({
                        ...prev,
                        [section]: { ...prev[section], [key]: val },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h3 className="text-md font-semibold mb-2">Security Settings</h3>
            <div className="space-y-2">
              {Object.entries(settings.security).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <SettingSwitch
                    section="security"
                    keyName={key}
                    value={value}
                    onChange={(section, key, val) =>
                      setSettings((prev) => ({
                        ...prev,
                        [section]: { ...prev[section], [key]: val },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>


          <div className="sticky bottom-2 theme-bg theme-border border-t pt-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <Switch
                  checked={published}
                  onChange={setPublished}
                  className={`${
                    published ? "bg-blue-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <span
                    className={`${
                      published ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">Publish Test</span>
              </label>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? (
                  <span className="loading loading-bars loading-sm" />
                ) : (
                  <span className="flex gap-2 items-center">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
