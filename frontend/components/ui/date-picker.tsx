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

export default function DatePickerComponent({
  dateValue,
  onDateChange,
  placeholder ='Pick a date',
  style,
  icon,
  dateFormat = 'dd/MM/yyyy',
}: {
  dateValue?: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?:string;
  style?:string;
  icon?:boolean;
  dateFormat?: string
}) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            " justify-start text-left font-normal bg-[#F6F6F6]",
            !date && "text-muted-foreground",
            style && style
          )}
        >
          <CalendarDays className="size-4 mr-2 mb-1" color="#121212" strokeWidth={1.5}/>
          {date ? format(date, dateFormat) : <span>{placeholder}</span>}
          {icon && <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate || new Date());
            onDateChange(newDate);
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={2050}
          
        />
      </PopoverContent>
    </Popover>
  );
}
