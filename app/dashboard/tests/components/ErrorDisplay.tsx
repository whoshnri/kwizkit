import { AlertCircle } from "lucide-react";

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <div className="theme-danger-bg border-2 border-dashed theme-danger-border-color rounded-md p-6 text-center space-y-2 max-w-sm w-full">
      <AlertCircle className="w-10 h-10 theme-danger-text mx-auto" />
      <p className="theme-danger-text font-semibold">Error loading tests</p>
      <p className="theme-danger-text text-sm">{message}</p>
    </div>
  </div>
);

export default ErrorDisplay;