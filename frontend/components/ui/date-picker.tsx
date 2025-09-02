"use client";

import { format } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  searchParamOption,
  searchParams,
} from "../dashboard/spend-analysis-comp/search-params";

export default function DatePickerComponent({
  dateValue,
  dateName,
  onDateChange,
  placeholder = "Pick a date",
  style,
  icon,
  dateFormat = "dd/MM/yyyy",
  isProject = false,
}: {
  dateValue: string;
  dateName: string;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  style?: string;
  icon?: boolean;
  dateFormat?: string;
  isProject?: boolean;
}) {
  const [, setParams] = useQueryStates(searchParams, searchParamOption);

  const [date, setDate] = React.useState<Date>(new Date(dateValue));

  React.useEffect(() => {
    setParams((prev) => ({
      ...prev,
      [dateName]: date ? format(date, "yyyy-MM-dd") : "",
    }));

    if (onDateChange) {
      onDateChange(date);
    }
  }, [date, setParams]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            " justify-start text-left font-normal bg-[#F6F6F6]",
            !date && "text-muted-foreground",
            style && style,
          )}
        >
          <CalendarDays
            className="size-4 mr-2 mb-1"
            color="#121212"
            strokeWidth={1.5}
          />
          {date ? format(dateValue, dateFormat) : <span>{placeholder}</span>}
          {icon && <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate || new Date());
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={new Date().getFullYear()}
          isEndDate={dateName === "endDate"}
          isProject={isProject}
        />
      </PopoverContent>
    </Popover>
  );
}
