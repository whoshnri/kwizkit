"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, File, Save } from "lucide-react";
import { Switch } from "@headlessui/react";
import { fetchUsers } from "@/app/actions/isUsersAdded";
import { saveSettings } from "@/app/actions/saveSettings";
import { fetchSettings } from "@/app/actions/fetchSettings";
import { Settings } from "@/lib/settings";

interface SettingsProps {
  testId: string;
  setShowSettingsModal: () => void;
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
  onChange: (section: "general" | "security", key: string, value: boolean) => void;
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
      allowRetake: false,
    },
    security: {
      enableTabSwitching: true,
      restrictIp: false,
      disableCopyPaste: false,
    },
    users: {
      usersAdded: false,
    },
  });

  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettingsAndUsers = async () => {
      if (!testId) return;

      try {
        const usersResult = await fetchUsers(testId);
        if ("error" in usersResult) throw new Error(usersResult.error);

        const settingsResult = await fetchSettings(testId);
        if ("error" in settingsResult) throw new Error(settingsResult.error);

        setSettings((prev) => ({
          ...prev,
          ...settingsResult.settings,
          users: {
            ...prev.users,
            usersAdded: usersResult.added,
          },
        }));
      } catch (err) {
        console.error("Failed to fetch settings or user uploads", err);
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

  const handleConfirmUpload = async () => {
    if (!selectedFile || !testId) return;

    setProcessingStatus("processing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("testId", testId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      setSettings((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          usersAdded: true,
        },
      }));

      setProcessingStatus("complete");
      setTimeout(() => {
        setProcessingStatus("idle");
        setSelectedFile(null);
        fileInputRef.current && (fileInputRef.current.value = "");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setProcessingStatus("error");

      setTimeout(() => {
        setProcessingStatus("idle");
        setSelectedFile(null);
        setErrorMessage(null);
        fileInputRef.current && (fileInputRef.current.value = "");
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveSettings(testId, settings);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-900 rounded shadow-lg w-full max-w-2xl h-[80vh] flex items-center justify-center">
          <span className="loading loading-bars loading-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black dark:text-white">Test Settings</h2>
            <button onClick={() => setShowSettingsModal(false)} type="button" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-md font-semibold text-black dark:text-white mb-2">General Settings</h3>
            <div className="space-y-2">
              {Object.entries(settings.general).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
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
            <h3 className="text-md font-semibold text-black dark:text-white mb-2">Security Settings</h3>
            <div className="space-y-2">
              {Object.entries(settings.security).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
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

          {/* Upload Users */}
          <div>
            <h3 className="text-md font-semibold text-black dark:text-white">Users</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Upload student list for this test</p>

            <div className="flex gap-4 mb-4">
              {["file", "url"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-1 rounded ${
                    uploadType === type ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
                  }`}
                  onClick={() => setUploadType(type as "file" | "url")}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {!settings.users.usersAdded && uploadType === "file" && !selectedFile && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setSelectedFile(file);
                }}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-black dark:text-white" />
                <p className="text-sm text-black dark:text-white">Drag and drop student list</p>
                <p className="text-xs text-gray-500">Supported: .csv, .xlsx</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx"
                  onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Select File
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5 text-black dark:text-white" />
                  <p className="text-sm text-black dark:text-white">
                    Selected file: {selectedFile.name}
                  </p>
                </div>
                <p className="text-xs text-red-500 mt-1">Changes cannot be undone.</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleConfirmUpload} type="button" className="bg-green-600 text-white px-4 py-2 rounded">
                    Confirm & Upload
                  </button>
                  <button onClick={() => setSelectedFile(null)} type="button" className="bg-gray-600 text-white px-4 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {processingStatus === "processing" && <p className="mt-2 text-sm text-black dark:text-white">Uploading...</p>}
            {processingStatus === "complete" && <p className="mt-2 text-sm text-green-600">Upload complete!</p>}
            {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

            {settings.users.usersAdded && (
              <div className="mt-4 text-sm text-black dark:text-white">
                Users have already been uploaded for this test.
              </div>
            )}
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
                <span className="text-sm font-medium text-black dark:text-white">Publish Test</span>
              </label>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
                  saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
