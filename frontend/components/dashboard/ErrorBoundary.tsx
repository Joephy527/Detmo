// components/ErrorBoundary.tsx
"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Button } from "../ui/button";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="px-4 mb-4 h-full">
      <div className="border rounded-md px-3 py-2 text-center h-full gird place-items-center">
        <p className="text-red-500 text-xs">Something went wrong</p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          Retry
        </Button>
      </div>
    </div>
  );
}

export function ErrorBoundaryCustom({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: any) =>
        console.error("Error caught by boundary:", error)
      }
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}
