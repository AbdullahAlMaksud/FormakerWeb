"use client";

import * as React from "react";
import { cn } from "./button";

export interface OTPInputProps {
  length?: 4 | 6;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 6, value = "", onChange, error }: OTPInputProps) {
  const inputRefs = React.useRef<HTMLInputElement[]>([]);

  // Split values or pad to length
  const digits = React.useMemo(() => {
    const arr = value.split("");
    while (arr.length < length) {
      arr.push("");
    }
    return arr.slice(0, length);
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/[^0-9]/g, "");
    if (!cleanVal && val !== "") return; // Skip if non-numeric

    const nextValue = [...digits];
    // Take the last character typed
    nextValue[index] = cleanVal.slice(-1);
    
    const combined = nextValue.join("");
    if (onChange) onChange(combined);

    // Auto-focus next input
    if (cleanVal && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Clear previous cell and focus it
        const nextValue = [...digits];
        nextValue[index - 1] = "";
        const combined = nextValue.join("");
        if (onChange) onChange(combined);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current cell
        const nextValue = [...digits];
        nextValue[index] = "";
        const combined = nextValue.join("");
        if (onChange) onChange(combined);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (onChange) onChange(pasteData);
    
    // Focus last character or next empty
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center items-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-10 h-12 text-center text-lg font-bold border border-input rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-ring transition-all shadow-sm",
            error && "border-destructive focus:ring-destructive",
            digit && "border-primary/80 ring-1 ring-primary/30"
          )}
        />
      ))}
    </div>
  );
}
