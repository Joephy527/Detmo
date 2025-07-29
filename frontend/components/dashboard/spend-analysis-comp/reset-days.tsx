"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryStates } from "nuqs";
import { searchParamOption, searchParams } from "./search-params";
import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ResetDateButton() {
  const [, setParams] = useQueryStates(searchParams, searchParamOption);

  const handleReset = () => {
    setParams((prev) => ({
      ...prev,
      startDate: format(new Date("2000-01-01"), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    }));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={handleReset} className="ml-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset date filters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
