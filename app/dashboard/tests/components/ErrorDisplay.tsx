import { AlertCircle } from "lucide-react";

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div className="w-full max-w-sm rounded-3xl border border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.06)] p-6 text-center">
      <AlertCircle className="mx-auto size-10 text-[var(--rubric-danger)]" />
      <p className="mt-3 font-medium text-[var(--rubric-danger)]">Error loading tests</p>
      <p className="mt-2 text-sm text-[var(--rubric-slate)]">{message}</p>
    </div>
  </div>
);

export default ErrorDisplay;