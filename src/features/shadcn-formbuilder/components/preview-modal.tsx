"use client";

import React, { useMemo } from "react";
import { useFormBuilder, FormElement } from "@/features/shadcn-formbuilder/context/form-builder-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { OTPInput } from "@/components/ui/otp-input";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Send, AlertCircle } from "lucide-react";
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

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose }) => {
  const { elements } = useFormBuilder();

  // Create validation schema dynamically
  const formSchema = useMemo(() => {
    const shape: any = {};
    elements.forEach((el) => {
      if (el.type === "label" || el.type === "button") return;

      let validator: any = z.string();

      if (el.type === "checkbox" || el.type === "switch") {
        validator = z.boolean();
        if (el.required) {
          validator = validator.refine((val: boolean) => val === true, {
            message: `${el.label} is required.`,
          });
        }
      } else if (el.type === "calendar") {
        validator = el.required
          ? z.date({ message: `${el.label} is required.` })
          : z.date().optional().nullable();
      } else if (el.type === "otp") {
        const len = el.otpLength || 6;
        validator = z
          .string()
          .length(len, { message: `${el.label} must be exactly ${len} digits.` });
      } else if (el.type === "file-upload") {
        validator = el.required
          ? z.array(z.any()).min(1, { message: `${el.label} is required.` })
          : z.array(z.any()).optional();
      } else {
        // text, textarea, select
        if (el.required) {
          validator = validator.min(1, { message: `${el.label} is required.` });
        } else {
          validator = validator.optional().or(z.literal(""));
        }

        if (el.validation?.pattern) {
          const regex = new RegExp(el.validation.pattern);
          validator = validator.refine(
            (val: string) => !val || regex.test(val),
            { message: `Invalid format for ${el.label}.` }
          );
        }
      }

      shape[el.name] = validator;
    });

    return z.object(shape);
  }, [elements]);

  // Create default values
  const defaultValues = useMemo(() => {
    const defaults: any = {};
    elements.forEach((el) => {
      if (el.type === "label" || el.type === "button") return;

      if (el.type === "checkbox" || el.type === "switch") {
        defaults[el.name] = el.defaultValue === "true";
      } else if (el.type === "calendar") {
        defaults[el.name] = null;
      } else if (el.type === "file-upload") {
        defaults[el.name] = [];
      } else {
        defaults[el.name] = el.defaultValue || "";
      }
    });
    return defaults;
  }, [elements]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: any) => {
    console.log("Submitted Preview Form Data:", values);

    // Nice success confetti trigger
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
    });

    alert("Form Submitted Successfully!\nCheck DevTools console to inspect values.");
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl glass-panel flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h4 className="font-semibold text-foreground text-sm tracking-wide uppercase">
              Live Interactive Preview
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary rounded flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {elements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs italic">
              Form is empty. Close preview and add fields to test.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-x-4 gap-y-4">
              {elements.map((el) => {
                const error = errors[el.name];
                const colSpan = WIDTH_CLASSES[el.width || "full"];
                const size = el.height || "md";

                if (el.type === "label") {
                  const Level = el.headingLevel || "h3";
                  const sizeClass =
                    Level === "h1"
                      ? "text-2xl font-extrabold tracking-tight"
                      : Level === "h2"
                        ? "text-xl font-bold tracking-tight"
                        : Level === "h3"
                          ? "text-lg font-semibold"
                          : "text-sm font-semibold";
                  return (
                    <div key={el.id} className={`${colSpan} pt-2`}>
                      <Level className={`${sizeClass} text-foreground`}>{el.label}</Level>
                      {el.description && (
                        <p className="text-xs text-muted-foreground mt-1">{el.description}</p>
                      )}
                    </div>
                  );
                }

                if (el.type === "button") {
                  const btnHeight = BUTTON_HEIGHT_CLASSES[size];
                  return (
                    <div key={el.id} className={`${colSpan} pt-2`}>
                      <Button
                        type="submit"
                        className={`w-full bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 ${btnHeight}`}
                      >
                        <Send className="h-4 w-4" />
                        {el.label}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div key={el.id} className={`${colSpan} space-y-1.5`}>
                    <div className="flex items-center gap-1">
                      <Label className="text-foreground/90 font-medium">
                        {el.label}
                      </Label>
                      {el.required && (
                        <span className="text-destructive font-bold">*</span>
                      )}
                    </div>

                    <Controller
                      name={el.name}
                      control={control}
                      render={({ field }) => {
                        if (el.type === "input") {
                          return (
                            <Input
                              {...field}
                              placeholder={el.placeholder}
                              error={!!error}
                              className={HEIGHT_CLASSES[size]}
                            />
                          );
                        }

                        if (el.type === "textarea") {
                          return (
                            <Textarea
                              {...field}
                              placeholder={el.placeholder}
                              error={!!error}
                              className={TEXTAREA_HEIGHT_CLASSES[size]}
                            />
                          );
                        }

                        if (el.type === "select") {
                          return (
                            <Select
                              {...field}
                              error={!!error}
                              className={HEIGHT_CLASSES[size]}
                            >
                              <option value="">{el.placeholder || "Select option..."}</option>
                              {el.options?.map((opt, i) => (
                                <option key={i} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          );
                        }

                        if (el.type === "checkbox") {
                          return (
                            <div className="flex items-center gap-2 py-0.5">
                              <Checkbox
                                id={el.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label
                                htmlFor={el.id}
                                className="text-xs text-muted-foreground cursor-pointer select-none"
                              >
                                {el.placeholder || "Accept option"}
                              </label>
                            </div>
                          );
                        }

                        if (el.type === "switch") {
                          return (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/15 border border-border/40">
                              <span className="text-xs text-muted-foreground">
                                {el.placeholder || "Enable this option"}
                              </span>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          );
                        }

                        if (el.type === "otp") {
                          return (
                            <OTPInput
                              length={el.otpLength}
                              value={field.value}
                              onChange={field.onChange}
                              error={!!error}
                            />
                          );
                        }

                        if (el.type === "calendar") {
                          return (
                            <Calendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={el.placeholder}
                              error={!!error}
                              className={HEIGHT_CLASSES[size]}
                            />
                          );
                        }

                        if (el.type === "file-upload") {
                          return (
                            <FileUpload
                              value={field.value}
                              onChange={field.onChange}
                              maxSize={el.validation?.fileMaxSize}
                              allowedTypes={el.validation?.fileTypes}
                              placeholder={el.placeholder}
                              error={!!error}
                            />
                          );
                        }

                        return <div />;
                      }}
                    />

                    {el.description && (
                      <p className="text-[10px] text-muted-foreground/80 leading-none">
                        {el.description}
                      </p>
                    )}

                    {error && (
                      <span className="text-xs text-destructive flex items-center gap-1.5 font-semibold pt-0.5 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error.message as string}
                      </span>
                    )}
                  </div>
                );
              })}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
