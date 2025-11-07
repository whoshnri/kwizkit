"use client";

import { makePrivate, makePublic } from "@/app/actions/makeActive";
import { Menu } from "@headlessui/react";
import { EarthIcon, Lock, MoreHorizontal, Settings, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { X, Clock, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

type DropdownProps = {
  testId: string;
  duration: number;
  visibility: boolean;
  onSettingsClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
};

export default function TestOptionsDropdown({
  testId,
  visibility,
  onSettingsClick,
  onDeleteClick,
  duration,
}: DropdownProps) {
  const router = useRouter();
  const [isConfirmingPublication, setIsConfirmingPublication] = useState(false);
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingsClick(testId);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(testId);
  };

  const editVisibility = async (e: React.MouseEvent, duration: number) => {
    if (visibility) {
      const res = await makePrivate(testId);
      if (res) {
        toast.success("Test is now private");
      } else {
        toast.error("Failed to update test visibility");
        window.location.reload();
      }
    } else {
      const res = await makePublic(testId, duration);
      if (!res) {
        toast.error("Failed to update test visibility");
      } else {
        toast.success("Test is now public");
        window.location.reload();
      }
    }
    setIsConfirmingPublication(false);
  };

  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center gap-2 rounded-md theme-bg px-3 py-1.5 text-sm font-semibold theme-text shadow focus:outline-none hover:bg-gray-800/70">
          <MoreHorizontal className="w-4 h-4" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-left rounded-xl border border-white/10 theme-bg backdrop-blur-md p-1 text-sm theme-text shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleSettingsClick}
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-colors ${
                  active ? "theme-bg-subtle" : ""
                }`}
              >
                <Settings className="w-4 h-4" />
                Edit Settings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={
                  visibility
                    ? (e) => editVisibility(e, duration ? duration : 0)
                    : (e) => setIsConfirmingPublication(true)
                }
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-colors ${
                  active ? "bg-blue-500/20" : ""
                }`}
              >
                {visibility ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <EarthIcon className="w-4 h-4" />
                )}
                {visibility ? "Make Private" : "Publish Test"}
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleDeleteClick}
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-colors text-red-500 ${
                  active ? "bg-red-500/20" : ""
                }`}
              >
                <Trash className="w-4 h-4" />
                Delete Test
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>

      <ConfirmPublication
        isOpen={isConfirmingPublication}
        onConfirm={editVisibility}
        duration={duration}
        onCancel={() => setIsConfirmingPublication(false)}
      />
    </div>
  );
}
type ConfirmPublicationProps = {
  isOpen: boolean;
  duration: number;
  onConfirm: (e: React.MouseEvent, duration: number) => Promise<void>;
  onCancel: () => void;
};

export function ConfirmPublication({
  isOpen,
  duration,
  onConfirm,
  onCancel,
}: ConfirmPublicationProps) {
  const [testDuration, setDuration] = useState<number>(duration);
  const [isPublishing, setIsPublishing] = useState(false);

  const isValid = typeof testDuration === "number" && testDuration > 0;

  const handleConfirm = async (e: React.MouseEvent) => {
    if (!isValid || isPublishing) return;

    setIsPublishing(true);
    try {
      await onConfirm(e, testDuration);
    } catch (error) {
      // Handle potential errors from the onConfirm promise if necessary
      console.error("Failed to publish:", error);
      setIsPublishing(false); // Reset state on failure
    }
    // No need to reset state on success as the modal will likely close
  };

  const formatDuration = (totalMinutes: number): string => {
  // Handle invalid or zero inputs
  if (!totalMinutes || totalMinutes <= 0) {
    return "Not set";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  return parts.join(" ");
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="theme-bg text-left theme-border-color border-2 border-dashed rounded-lg shadow-xl p-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Publication</h2>
          <button
            onClick={onCancel}
            disabled={isPublishing}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="theme-text-secondary mb-6 text-left">
          Before publishing, please set the test duration. This cannot be
          changed later.
        </p>

        <div className="mb-3">
          {/* 4. Enhanced Label: Added an icon for better visual context */}
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            Test Duration (in minutes)
          </label>
          {/* 5. Consistent Input Styling */}
          <input
            type="number"
            value={testDuration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
            placeholder="e.g., 60"
            min={1}
            autoFocus
            className="theme-input w-full"
          />
        </div>
        <span className="text-left w-full self-start mb-8">Set Duration: {formatDuration(testDuration as number)}</span>

        {/* 6. Consistent Button Styling & UX */}
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={onCancel}
            disabled={isPublishing}
            className="px-4 py-2 rounded-md font-semibold text-sm theme-text-secondary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!isValid || isPublishing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isPublishing ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Publishing...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}