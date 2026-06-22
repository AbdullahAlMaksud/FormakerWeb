"use client";

import React, { useState, useRef } from "react";
import { useFormBuilder, FormElement, ElementType } from "@/features/shadcn-formbuilder/context/form-builder-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { OTPInput } from "@/components/ui/otp-input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Copy, Edit2, GripVertical, Plus, Download, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng, toBlob } from "html-to-image";
import confetti from "canvas-confetti";

const WIDTH_CLASSES = {
  "1/4": "col-span-12 sm:col-span-3",
  "1/3": "col-span-12 sm:col-span-4",
  "1/2": "col-span-12 sm:col-span-6",
  "full": "col-span-12",
};

const HEIGHT_CLASSES = {
  sm: "h-8 text-xs py-1 px-2.5",
  md: "h-9 text-sm py-1.5 px-3",
  lg: "h-11 text-base py-2.5 px-4",
};

const TEXTAREA_HEIGHT_CLASSES = {
  sm: "min-h-[50px] text-xs py-1 px-2.5",
  md: "min-h-[80px] text-sm py-1.5 px-3",
  lg: "min-h-[140px] text-base py-2.5 px-4",
};

const BUTTON_HEIGHT_CLASSES = {
  sm: "h-8 text-xs px-3 py-1",
  md: "h-9 text-sm px-4 py-2",
  lg: "h-11 text-base px-8 py-3",
};

export const BuilderCanvas: React.FC = () => {
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    addElement,
    removeElement,
    duplicateElement,
    reorderElements,
  } = useFormBuilder();

  const [copiedImg, setCopiedImg] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const exportAsPng = async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, {
        backgroundColor: "hsl(var(--background))",
        style: {
          transform: "scale(1)",
        },
        filter: (node: any) => {
          if (node.classList && node.classList.contains("exclude-export")) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = "designed-form.png";
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
      });
    } catch (error) {
      console.error("Oops, something went wrong with png export!", error);
    }
  };

  const copyToClipboardAsImage = async () => {
    if (!exportRef.current) return;
    try {
      const blob = await toBlob(exportRef.current, {
        backgroundColor: "hsl(var(--background))",
        style: {
          transform: "scale(1)",
        },
        filter: (node: any) => {
          if (node.classList && node.classList.contains("exclude-export")) {
            return false;
          }
          return true;
        },
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopiedImg(true);
        setTimeout(() => setCopiedImg(false), 2000);
        confetti({
          particleCount: 30,
          spread: 30,
          origin: { y: 0.8 },
        });
      }
    } catch (error) {
      console.error("Oops, failed to copy image to clipboard!", error);
    }
  };

  const handleCanvasBackgroundDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData("text/plain");

    if (typeStr && !typeStr.startsWith("reorder:")) {
      // Append new element to the end
      addElement(typeStr as ElementType);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasBackgroundDrop}
      className="flex-1 h-full min-h-[500px] rounded-xl border border-border/80 bg-background/25 glass-panel p-6 overflow-y-auto flex flex-col relative"
    >
      <div className="flex-1 flex flex-col">
        {elements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-12 text-center text-muted-foreground select-none bg-background/5">
            <div className="p-4 rounded-full bg-secondary/40 border border-border mb-4 animate-fade-in">
              <Plus className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h4 className="text-base font-semibold text-foreground mb-1">Canvas is empty</h4>
            <p className="text-xs max-w-sm mb-4">
              Drag components from the library or click them to start building your custom form.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full flex-1">
            {/* Header Tools */}
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3 exclude-export">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_#8b5cf6]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Designed Form Preview
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyToClipboardAsImage}
                  className="h-7 text-[10px] px-2.5 flex items-center gap-1.5 bg-secondary/20 hover:bg-secondary/40 border border-border rounded-md text-foreground font-semibold cursor-pointer transition-colors"
                >
                  {copiedImg ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copiedImg ? "Copied!" : "Copy Image"}
                </button>
                <button
                  type="button"
                  onClick={exportAsPng}
                  className="h-7 text-[10px] px-2.5 flex items-center gap-1.5 bg-secondary/20 hover:bg-secondary/40 border border-border rounded-md text-foreground font-semibold cursor-pointer transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export PNG
                </button>
              </div>
            </div>

            {/* Captured Element Wrapper Grid */}
            <div
              ref={exportRef}
              className="p-6 rounded-xl border border-border/60 bg-card/65 text-card-foreground shadow-sm grid grid-cols-12 gap-x-4 gap-y-4"
            >
              <AnimatePresence initial={false}>
                {elements.map((element, idx) => (
                  <CanvasElementWrapper
                    key={element.id}
                    element={element}
                    index={idx}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                    onDelete={() => removeElement(element.id)}
                    onDuplicate={() => duplicateElement(element.id)}
                    addElement={addElement}
                    reorderElements={reorderElements}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CanvasElementWrapper handles drag & drop, positioning and heights
interface CanvasElementWrapperProps {
  element: FormElement;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  addElement: (type: ElementType, index?: number) => string;
  reorderElements: (startIndex: number, endIndex: number) => void;
}

const CanvasElementWrapper: React.FC<CanvasElementWrapperProps> = ({
  element,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  addElement,
  reorderElements,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dragOverPos, setDragOverPos] = useState<"before" | "after" | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", `reorder:${index}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const isInline = element.width && element.width !== "full";

    if (isInline) {
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        setDragOverPos("before");
      } else {
        setDragOverPos("after");
      }
    } else {
      const y = e.clientY - rect.top;
      if (y < rect.height / 2) {
        setDragOverPos("before");
      } else {
        setDragOverPos("after");
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPos(null);

    const typeStr = e.dataTransfer.getData("text/plain");
    if (!typeStr) return;

    let targetIdx = dragOverPos === "before" ? index : index + 1;

    if (typeStr.startsWith("reorder:")) {
      const fromIdx = parseInt(typeStr.replace("reorder:", ""), 10);
      if (isNaN(fromIdx)) return;

      if (fromIdx < targetIdx) {
        targetIdx--;
      }
      reorderElements(fromIdx, targetIdx);
    } else {
      addElement(typeStr as ElementType, targetIdx);
    }
  };

  const colSpanClass = WIDTH_CLASSES[element.width || "full"];

  const size = element.height || "md";
  const heightClass = HEIGHT_CLASSES[size];
  const textareaHeightClass = TEXTAREA_HEIGHT_CLASSES[size];
  const buttonHeightClass = BUTTON_HEIGHT_CLASSES[size];

  const otpSize = size === "sm" ? 4 : size === "lg" ? 6 : 6;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group p-5 rounded-lg border transition-all duration-150 cursor-pointer ${colSpanClass} ${isSelected
          ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.15)] ring-1 ring-primary/20"
          : "border-border/60 bg-secondary/10 hover:border-border hover:bg-secondary/25 hover:shadow-md"
        }`}
    >
      {/* Drop Indicators Overlay borders */}
      {dragOverPos === "before" && (
        <div
          className={`absolute z-30 pointer-events-none rounded transition-all duration-150 exclude-export ${element.width && element.width !== "full"
              ? "left-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_10px_#8b5cf6]"
              : "left-0 right-0 top-0 h-1.5 bg-primary shadow-[0_0_10px_#8b5cf6]"
            }`}
        />
      )}
      {dragOverPos === "after" && (
        <div
          className={`absolute z-30 pointer-events-none rounded transition-all duration-150 exclude-export ${element.width && element.width !== "full"
              ? "right-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_10px_#8b5cf6]"
              : "left-0 right-0 bottom-0 h-1.5 bg-primary shadow-[0_0_10px_#8b5cf6]"
            }`}
        />
      )}

      {/* Floating Control Toolbar */}
      <div
        className={`absolute -top-3.5 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-card/90 shadow-lg text-[10px] font-semibold transition-opacity duration-150 exclude-export ${isHovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
      >
        <div
          draggable
          onDragStart={handleDragStart}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5"
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="w-[1px] h-3 bg-border" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="text-muted-foreground hover:text-primary p-0.5"
          title="Edit properties"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="text-muted-foreground hover:text-emerald-400 p-0.5"
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground hover:text-destructive p-0.5"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Mock Form Field Preview */}
      <div className="space-y-1.5 pointer-events-none">
        {element.type !== "label" && element.type !== "button" && (
          <div className="flex items-center gap-1">
            <Label className="text-foreground/90 font-medium">
              {element.label}
            </Label>
            {element.required && <span className="text-destructive font-bold">*</span>}
          </div>
        )}

        {/* Input Text Box */}
        {element.type === "input" && (
          <Input
            placeholder={element.placeholder || "Enter value..."}
            disabled
            className={heightClass}
          />
        )}

        {/* Text Area */}
        {element.type === "textarea" && (
          <Textarea
            placeholder={element.placeholder || "Enter description..."}
            disabled
            className={textareaHeightClass}
          />
        )}

        {/* Dropdown Select */}
        {element.type === "select" && (
          <Select disabled className={heightClass}>
            <option>{element.placeholder || "Select option..."}</option>
            {element.options?.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        {/* File Upload Zone */}
        {element.type === "file-upload" && (
          <FileUpload
            placeholder={element.placeholder}
            maxSize={element.validation?.fileMaxSize}
            allowedTypes={element.validation?.fileTypes}
          />
        )}

        {/* OTP Input Grid */}
        {element.type === "otp" && <OTPInput length={element.otpLength || otpSize} />}

        {/* Date Calendar Picker */}
        {element.type === "calendar" && <Calendar placeholder={element.placeholder} />}

        {/* Custom Section Title/Header Label */}
        {element.type === "label" && (
          <div>
            {element.headingLevel === "h1" && (
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {element.label}
              </h1>
            )}
            {element.headingLevel === "h2" && (
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {element.label}
              </h2>
            )}
            {element.headingLevel === "h3" && (
              <h3 className="text-lg font-semibold text-foreground">
                {element.label}
              </h3>
            )}
            {element.headingLevel === "h4" && (
              <h4 className="text-sm font-semibold text-foreground">
                {element.label}
              </h4>
            )}
            {element.headingLevel === "p" && (
              <p className="text-sm text-foreground/80 leading-relaxed">
                {element.label}
              </p>
            )}
          </div>
        )}

        {/* Checkbox Single */}
        {element.type === "checkbox" && (
          <div className="flex items-center gap-2 py-1">
            <Checkbox disabled checked={element.defaultValue === "true"} />
            <Label className="text-xs text-muted-foreground">
              {element.placeholder || "Agree to options"}
            </Label>
          </div>
        )}

        {/* Switch Toggle */}
        {element.type === "switch" && (
          <div className="flex items-center gap-3 py-1">
            <Switch disabled checked={element.defaultValue === "true"} />
            <Label className="text-xs text-muted-foreground">
              {element.placeholder || "Enable feature"}
            </Label>
          </div>
        )}

        {/* Radio Option Buttons Group */}
        {element.type === "radio" && (
          <div className="space-y-1.5 pt-0.5">
            {element.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  disabled
                  name={element.id}
                  checked={i === 0}
                  className="h-3.5 w-3.5 text-primary bg-transparent border-input focus-visible:ring-primary cursor-pointer accent-primary"
                />
                <span className="text-xs text-muted-foreground select-none">{opt.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Submission Button */}
        {element.type === "button" && (
          <div className="w-full pt-1.5">
            <button
              type="button"
              className={`w-full bg-primary text-primary-foreground font-semibold rounded-md transition-all hover:bg-primary/95 flex items-center justify-center ${buttonHeightClass}`}
            >
              {element.label}
            </button>
          </div>
        )}

        {/* Optional Subtext Description */}
        {element.type !== "label" && element.type !== "button" && element.description && (
          <p className="text-[10px] text-muted-foreground/75 italic">
            {element.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};
