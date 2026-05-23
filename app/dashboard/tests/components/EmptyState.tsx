import { FileText } from "lucide-react";

type EmptyStateProps = {
  hasTests: boolean;
  onCreate: () => void;
};

const EmptyState = ({ hasTests, onCreate }: EmptyStateProps) => (
  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] py-16 text-center">
    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)]">
      <FileText size={40} className="text-[var(--rubric-muted)]" />
    </div>
    <h3 className="mb-2 text-lg font-medium text-[var(--rubric-black)]">
      {hasTests ? "No tests match your search" : "No tests created yet"}
    </h3>
    <p className="mb-6 text-sm text-[var(--rubric-slate)]">
      {hasTests
        ? "Try adjusting your search or filter"
        : "Create your first test to get started"}
    </p>
    {!hasTests && (
      <button onClick={onCreate} className="rubric-button-primary mx-auto">
        Create Your First Test
      </button>
    )}
  </div>
);

export default EmptyState;