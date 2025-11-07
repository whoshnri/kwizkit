import { FileText } from "lucide-react";

type EmptyStateProps = {
  hasTests: boolean;
  onCreate: () => void;
};

const EmptyState = ({ hasTests, onCreate }: EmptyStateProps) => (
  <div className="animated-content text-center py-12">
    <div className="mx-auto w-24 h-24 rounded-md flex items-center justify-center mb-4 border-2 border-dashed theme-border-color">
      <FileText size={40} className="theme-text-secondary" />
    </div>
    <h3 className="text-lg font-medium theme-text mb-2">
      {hasTests ? "No tests match your search" : "No tests created yet"}
    </h3>
    <p className="theme-text-secondary mb-4">
      {hasTests
        ? "Try adjusting your search or filter"
        : "Create your first test to get started"}
    </p>
    {!hasTests && (
      <button onClick={onCreate} className="theme-button-primary w-fit py-3 px-2">
        Create Your First Test
      </button>
    )}
  </div>
);

export default EmptyState;