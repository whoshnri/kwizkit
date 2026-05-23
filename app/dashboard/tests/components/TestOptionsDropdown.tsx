"use client";

import { makePrivate, makePublic } from "@/app/actions/makeActive";
import {
  PiClock,
  PiDotsThree,
  PiGear,
  PiGlobeHemisphereEast,
  PiLock,
  PiTrash,
} from "react-icons/pi";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { HourglassMediumIcon } from "@phosphor-icons/react";

import {
  ConfirmationDialog,
  DashboardButton,
  fieldClass,
} from "../../components/primitives";
import {
  DashboardDropdown,
  DashboardDropdownContent,
  DashboardDropdownItem,
  DashboardDropdownTrigger,
} from "../../components/DashboardDropdown";

type DropdownProps = {
  testId: string;
  duration: number;
  visibility: boolean;
  onSettingsClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  iconOnly?: boolean;
  label?: ReactNode;
};

export default function TestOptionsDropdown({
  testId,
  visibility,
  onSettingsClick,
  onDeleteClick,
  duration,
  iconOnly,
  label,
}: DropdownProps) {
  const [isConfirmingPublication, setIsConfirmingPublication] = useState(false);

  const handleSettingsClick = () => {
    onSettingsClick(testId);
  };

  const handleDeleteClick = () => {
    onDeleteClick(testId);
  };

  const editVisibility = async (testDuration: number) => {
    if (visibility) {
      const res = await makePrivate(testId);
      if (res) {
        toast.success("Test is now private");
      } else {
        toast.error("Failed to update test visibility");
        window.location.reload();
      }
    } else {
      const res = await makePublic(testId, testDuration);
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
      <DashboardDropdown>
        <DashboardDropdownTrigger asChild>
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-sm font-semibold text-[var(--rubric-black)] transition hover:bg-[var(--surface-muted)] focus:outline-none ${
            iconOnly ? "h-8 w-8 border-0 bg-transparent px-0" : "h-12 px-5"
          }`}
        >
          {label ?? <PiDotsThree className="h-5 w-5" />}
          </button>
        </DashboardDropdownTrigger>
        <DashboardDropdownContent align="end" className="w-56">
          <DashboardDropdownItem onSelect={handleSettingsClick}>
            <PiGear className="h-4 w-4" />
            Edit Settings
          </DashboardDropdownItem>
          <DashboardDropdownItem
            onSelect={() =>
              visibility
                ? void editVisibility(duration ? duration : 0)
                : setIsConfirmingPublication(true)
            }
          >
            {visibility ? <PiLock className="h-4 w-4" /> : <PiGlobeHemisphereEast className="h-4 w-4" />}
            {visibility ? "Make Private" : "Publish Test"}
          </DashboardDropdownItem>
          <DashboardDropdownItem onSelect={handleDeleteClick} className="text-[var(--rubric-danger)] focus:bg-[rgba(180,35,24,0.08)]">
            <PiTrash className="h-4 w-4" />
            Delete Test
          </DashboardDropdownItem>
        </DashboardDropdownContent>
      </DashboardDropdown>

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
  onConfirm: (duration: number) => Promise<void>;
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
      await onConfirm(testDuration);
    } catch (error) {
      console.error("Failed to publish:", error);
      setIsPublishing(false);
    }
  };

  const formatDuration = (totalMinutes: number): string => {
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
    <ConfirmationDialog
      title="Confirm publication"
      description="Before publishing, set the test duration. This cannot be changed later."
      onClose={onCancel}
      footer={
        <>
          <DashboardButton onClick={onCancel} disabled={isPublishing} variant="secondary" className="flex-1">
            Cancel
          </DashboardButton>
          <DashboardButton onClick={handleConfirm} disabled={!isValid || isPublishing} className="flex-1">
            {isPublishing ? "Publishing..." : "Publish"}
          </DashboardButton>
        </>
      }
    >
        <div className="rounded-xl border border-[var(--border)] bg-[#FAF8F3] p-3">
          <label className="mb-2 flex items-center gap-2 text-base text-[var(--rubric-muted)]">
            <HourglassMediumIcon size={20} />


            Test duration (in minutes)
          </label>
          <input
            type="number"
            value={testDuration}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="e.g., 60"
            min={1}
            autoFocus
            className={`${fieldClass} h-10 border-0 bg-transparent px-0 focus:border-0`}
          />
          <span className="mt-1 block text-sm font-semibold text-[var(--rubric-black)]">
            Set duration: {formatDuration(testDuration as number)}
          </span>
        </div>
    </ConfirmationDialog>
  );
}
