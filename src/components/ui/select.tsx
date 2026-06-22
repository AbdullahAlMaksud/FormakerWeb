"use client";

import * as React from "react";
import { cn } from "./button";
import { ChevronDown, Check } from "lucide-react";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  error?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, children, error, value, onChange, placeholder, name, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Parse options from standard <option> children tags
    const options = React.useMemo(() => {
      return React.Children.toArray(children)
        .filter(
          (child): child is React.ReactElement =>
            React.isValidElement(child) &&
            (child.type === "option" || (child.props as any).value !== undefined)
        )
        .map((child) => {
          const props = child.props as any;
          return {
            value: String(props.value || ""),
            label: String(props.children || ""),
          };
        });
    }, [children]);

    // Find selected label
    const selectedOption = options.find((opt) => opt.value === String(value || ""));
    const displayLabel = selectedOption ? selectedOption.label : placeholder || options[0]?.label || "Select option...";

    // Handle outside clicks
    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
      setIsOpen(false);
      if (onChange) {
        // Construct a mock ChangeEvent for compatibility
        const mockEvent = {
          target: {
            value: val,
            name: name || "",
          },
          currentTarget: {
            value: val,
            name: name || "",
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(mockEvent);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Dropdown Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 select-none",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          {...(props as any)}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {/* Floating Custom Options Menu */}
        {isOpen && options.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-1 duration-100">
            {options.map((opt) => {
              const isSelected = opt.value === String(value || "");
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none hover:bg-accent hover:text-accent-foreground transition-colors text-left font-medium",
                    isSelected && "bg-accent/60 text-accent-foreground font-semibold"
                  )}
                >
                  {isSelected && (
                    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
