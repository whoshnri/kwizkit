import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { MdStar } from "react-icons/md";
import TestOptionsDropdown from "./TestOptionsDropdown";
import { Test } from "@/lib/test";

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

  const saveToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/test/${test.id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="animated-content rounded-md border-2 border-dashed theme-border-color flex flex-col"
    >
      <div
        onClick={() =>
          router.push(`/dashboard/tests/${test.slug}?testId=${test.id}`)
        }
        className="p-4 flex-grow cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-4">
          <MdStar className={`${test.difficulty == "easy" ? "text-green-500" : test.difficulty == "medium" ? "text-yellow-500" : "text-red-500"}`} />
          <span className="text-xs font-medium uppercase theme-text-secondary">
            {test.difficulty} 
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{test.name}</h3>
        <p className="theme-text-secondary mb-4 text-sm uppercase">
          Subject: {test.subject}
        </p>
        <div className="flex gap-2 text-xs theme-text-secondary">
          <span>{test.numberOfQuestions ? test.numberOfQuestions : 0} questions</span>
          <span>{test.totalMarks ? test.totalMarks : 0} marks</span>
        </div>
      </div>
      <div className="p-1 border-t-2 border-dashed theme-border-color">
        <div className="flex theme-bg-subtle items-center justify-between gap-2 p-1 rounded">
          {test.visibility ? (
            <button
              onClick={saveToClipboard}
              className="theme-button-secondary text-xs flex-1 py-1"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Share
                </>
              )}
            </button>
          ) : (
            <span className="text-xs font-semibold theme-text-secondary px-3">
              Private
            </span>
          )}
          <TestOptionsDropdown
          visibility={test.visibility}
            testId={test.id}
            duration={test.duration ? test.duration : 0}
            onSettingsClick={onSettingsClick}
            onDeleteClick={onDeleteClick}
          />
        </div>
      </div>
    </div>
  );
}