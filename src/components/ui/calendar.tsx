"use client";

import * as React from "react";
import { cn } from "./button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function Calendar({ value, onChange, placeholder = "Pick a date", error, className }: CalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  const days = [];
  
  // Fill in prefix days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Fill in days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Fill in suffix days for next month to complete grid (usually 42 boxes)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors text-left items-center justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring",
          !value && "text-muted-foreground",
          error && "border-destructive focus:ring-destructive",
          className
        )}
      >
        <span className="truncate">{value ? formatDate(value) : placeholder}</span>
        <CalendarIcon className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 rounded-md border border-border bg-card text-card-foreground shadow-md w-[280px] right-0 sm:left-0">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-7 w-7 bg-transparent hover:bg-accent rounded flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold">
              {monthsList[month]} {year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-7 w-7 bg-transparent hover:bg-accent rounded flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold opacity-60 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(item.date)}
                className={cn(
                  "h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-colors",
                  !item.isCurrentMonth && "text-muted-foreground/40 hover:bg-accent/40",
                  item.isCurrentMonth && "hover:bg-accent",
                  isToday(item.date) && "border border-primary text-primary",
                  isSelected(item.date) && "bg-primary text-primary-foreground font-semibold hover:bg-primary/95"
                )}
              >
                {item.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
