"use client";

import { useQueryStates } from "nuqs";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { searchParamOption, searchParams } from "./search-params";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyStateFallback = ({ message, className }: EmptyStateProps) => {
  const [params] = useQueryStates(searchParams, searchParamOption); // Get your date params from nuqs

  const { startDate, endDate } = params;

  return (
    <div
      className={cn(
        "w-full min-h-64 flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <CalendarDays className="w-10 h-10 text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="text-lg font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground max-w-64">
            No data for {message} in the date range{" "}
            <span className="font-medium">
              {startDate || "..."} - {endDate || "..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
