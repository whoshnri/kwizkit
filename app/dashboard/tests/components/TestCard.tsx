import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiCheck, PiCopy, PiGear } from "react-icons/pi";
import TestOptionsDropdown from "./TestOptionsDropdown";
import { Test } from "@/lib/test";
import { DashboardButton, DashboardPanel, StatusBadge } from "../../components/primitives";
import { LockIcon } from "@phosphor-icons/react";

type TestCardProps = {
  test: Test;
  index: number;
  onSettingsClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
};

export default function TestCard({
  test,
  index,
  onSettingsClick,
  onDeleteClick,
}: TestCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const subjectName =
    typeof test.subject === "string"
      ? test.subject
      : test.subjectName || test.subject?.name || "No subject";

  const saveToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/live/${test.slug}/access`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardPanel
      style={{ animationDelay: `${index * 50}ms` }}
      className="flex min-h-[232px] flex-col overflow-visible p-5"
    >
      <div
        onClick={() =>
          router.push(`/dashboard/tests/${test.slug}`)
        }
        className="flex-grow cursor-pointer"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <StatusBadge
            tone={
              test.difficulty === "easy"
                ? "success"
                : test.difficulty === "medium"
                  ? "warning"
                  : "danger"
            }
          >
            {test.difficulty}
          </StatusBadge>
          {/* <TestOptionsDropdown
            visibility={test.visibility}
            testId={test.id}
            duration={test.duration ? test.duration : 0}
            onSettingsClick={onSettingsClick}
            onDeleteClick={onDeleteClick}
            iconOnly
          /> */}
        </div>
        <h3 className="text-xl font-normal tracking-normal">{test.name}</h3>
        <p className="mb-5 mt-4 text-sm text-[var(--rubric-muted)]">
          Subject: {subjectName}
        </p>
        <div className="flex gap-5 text-sm text-[var(--rubric-muted)]">
          <span>{test.numberOfQuestions ? test.numberOfQuestions : 0} questions</span>
          <span>{test.totalMarks ? test.totalMarks : 0} marks</span>
          {(test as any).assignedClasses?.length > 0 && (
            <span>{(test as any).assignedClasses.length} classes</span>
          )}
        </div>
      </div>
      <div className="mt-5 flex min-h-[66px] items-center justify-between gap-3 rounded-lg bg-[#FAF8F3] p-2">
          {test.visibility ? (
            <DashboardButton
              type="button"
              variant="secondary"
              onClick={saveToClipboard}
              className="h-12 px-5"
            >
              {copied ? (
                <>
                  <PiCheck size={18} /> Copied!
                </>
              ) : (
                <>
                  <PiCopy size={18} /> Share
                </>
              )}
            </DashboardButton>
          ) : (
            <div className="px-3 inline-flex items-center gap-2 text-base font-semibold text-[var(--rubric-muted)]">
              <LockIcon/> Private
            </div>
          )}
          <TestOptionsDropdown
            visibility={test.visibility}
            testId={test.id}
            duration={test.duration ? test.duration : 0}
            onSettingsClick={onSettingsClick}
            onDeleteClick={onDeleteClick}
            label={
              <>
                <PiGear className="h-5 w-5" />
                Settings
              </>
            }
          />
      </div>
    </DashboardPanel>
  );
}
