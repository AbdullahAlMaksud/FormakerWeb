"use client";

import React from "react";
import { useFormBuilder, ElementType } from "@/features/shadcn-formbuilder/context/form-builder-context";
import {
  Type,
  AlignLeft,
  ChevronDown,
  Upload,
  Hash,
  Calendar,
  Heading,
  CheckSquare,
  ToggleLeft,
  CircleDot,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

interface LibraryItem {
  type: ElementType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    type: "label",
    label: "Heading / Title",
    description: "Heading text blocks for structure",
    icon: Heading,
    color: "from-blue-500/20 to-blue-600/5 hover:border-blue-500/40 text-blue-400",
  },
  {
    type: "input",
    label: "Text Input",
    description: "Standard text or email entry box",
    icon: Type,
    color: "from-indigo-500/20 to-indigo-600/5 hover:border-indigo-500/40 text-indigo-400",
  },
  {
    type: "textarea",
    label: "Text Area",
    description: "Multi-line text input for messages",
    icon: AlignLeft,
    color: "from-purple-500/20 to-purple-600/5 hover:border-purple-500/40 text-purple-400",
  },
  {
    type: "select",
    label: "Select Dropdown",
    description: "Choose a value from a dropdown list",
    icon: ChevronDown,
    color: "from-pink-500/20 to-pink-600/5 hover:border-pink-500/40 text-pink-400",
  },
  {
    type: "radio",
    label: "Radio Options",
    description: "Select one option out of multiple",
    icon: CircleDot,
    color: "from-rose-500/20 to-rose-600/5 hover:border-rose-500/40 text-rose-400",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "A binary option toggle checklist item",
    icon: CheckSquare,
    color: "from-amber-500/20 to-amber-600/5 hover:border-amber-500/40 text-amber-400",
  },
  {
    type: "switch",
    label: "Switch Toggle",
    description: "Premium smooth sliding switch toggle",
    icon: ToggleLeft,
    color: "from-orange-500/20 to-orange-600/5 hover:border-orange-500/40 text-orange-400",
  },
  {
    type: "calendar",
    label: "Date Picker",
    description: "Interactive calendar date picker",
    icon: Calendar,
    color: "from-emerald-500/20 to-emerald-600/5 hover:border-emerald-500/40 text-emerald-400",
  },
  {
    type: "otp",
    label: "OTP Input",
    description: "One-Time Password grid inputs",
    icon: Hash,
    color: "from-teal-500/20 to-teal-600/5 hover:border-teal-500/40 text-teal-400",
  },
  {
    type: "file-upload",
    label: "File Upload",
    description: "Drag-and-drop zone file selector",
    icon: Upload,
    color: "from-cyan-500/20 to-cyan-600/5 hover:border-cyan-500/40 text-cyan-400",
  },
  {
    type: "button",
    label: "Form Button",
    description: "Action button to submit the form",
    icon: MousePointerClick,
    color: "from-violet-500/20 to-violet-600/5 hover:border-violet-500/40 text-violet-400",
  },
];

export const SidebarLibrary: React.FC = () => {
  const { addElement } = useFormBuilder();

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
            Fields Library
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Drag fields into the canvas or click them to append them to your form.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
        {LIBRARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => addElement(item.type)}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-gradient-to-br cursor-grab active:cursor-grabbing transition-all select-none hover:shadow-lg ${item.color}`}
            >
              <div className="p-1.5 rounded-md bg-background/60 shadow-sm shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-foreground">
                  {item.label}
                </div>
                <div className="text-[10px] text-muted-foreground leading-normal">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
