"use client";

import React, { useState } from "react";
import { useFormBuilder, FormElement } from "@/features/shadcn-formbuilder/context/form-builder-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Download, FileJson, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export const CodeGenerator: React.FC = () => {
  const { elements, importSchema, exportSchema } = useFormBuilder();
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#a78bfa", "#8b5cf6", "#6366f1", "#3b82f6", "#10b981"],
    });
  };

  // Helper to generate the zod validation schema code
  const generateZodSchema = (): string => {
    const fields = elements.filter((el) => el.type !== "label" && el.type !== "button");
    if (fields.length === 0) return "const formSchema = z.object({});";

    let code = "const formSchema = z.object({\n";
    fields.forEach((el) => {
      let zodRule = "";
      if (el.type === "checkbox" || el.type === "switch") {
        zodRule = "z.boolean()";
        if (el.required) {
          zodRule += `.refine((val) => val === true, { message: "${el.label} must be checked" })`;
        } else {
          zodRule += `.default(${el.defaultValue === "true"})`;
        }
      } else if (el.type === "calendar") {
        zodRule = el.required
          ? `z.date({ message: "${el.label} is required." })`
          : "z.date().optional()";
      } else if (el.type === "otp") {
        zodRule = `z.string().length(${el.otpLength || 6}, { message: "OTP must be exactly ${el.otpLength || 6} characters." })`;
      } else if (el.type === "file-upload") {
        zodRule = el.required
          ? `z.any().refine((files) => files && files.length > 0, "${el.label} is required.")`
          : "z.any().optional()";
      } else {
        // Standard text/textarea/select inputs
        zodRule = "z.string()";
        if (el.required) {
          zodRule += `.min(1, { message: "${el.label} is required." })`;
        } else {
          zodRule += ".optional()";
        }

        if (el.validation?.pattern) {
          if (el.validation.pattern === "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") {
            zodRule += `.email({ message: "Invalid email address." })`;
          } else {
            zodRule += `.regex(new RegExp("${el.validation.pattern.replace(/\\/g, "\\\\")}"), { message: "Invalid format." })`;
          }
        }

        if (el.validation?.min !== undefined) {
          zodRule += `.min(${el.validation.min})`;
        }
        if (el.validation?.max !== undefined) {
          zodRule += `.max(${el.validation.max})`;
        }
      }

      code += `  ${el.name}: ${zodRule},\n`;
    });
    code += "});";
    return code;
  };

  // Helper to generate the default values object code
  const generateDefaultValues = (): string => {
    const fields = elements.filter((el) => el.type !== "label" && el.type !== "button");
    if (fields.length === 0) return "{}";

    let code = "{\n";
    fields.forEach((el) => {
      let defaultVal = '""';
      if (el.type === "checkbox" || el.type === "switch") {
        defaultVal = el.defaultValue === "true" ? "true" : "false";
      } else if (el.type === "calendar") {
        defaultVal = "undefined";
      } else if (el.type === "file-upload") {
        defaultVal = "[]";
      } else if (el.defaultValue) {
        defaultVal = `"${el.defaultValue}"`;
      }

      code += `      ${el.name}: ${defaultVal},\n`;
    });
    code += "    }";
    return code;
  };

  // Helper to generate the JSX elements
  const generateJSXFields = (): string => {
    let jsx = "";
    elements.forEach((el) => {
      const colSpan = el.width === "1/4" ? "col-span-12 sm:col-span-3"
        : el.width === "1/3" ? "col-span-12 sm:col-span-4"
          : el.width === "1/2" ? "col-span-12 sm:col-span-6"
            : "col-span-12";
      const size = el.height || "md";

      if (el.type === "label") {
        const level = el.headingLevel || "h3";
        const sizeClass =
          level === "h1"
            ? "text-2xl font-extrabold tracking-tight"
            : level === "h2"
              ? "text-xl font-bold tracking-tight"
              : level === "h3"
                ? "text-lg font-semibold"
                : "text-sm font-semibold";

        jsx += `        <div className="${colSpan} pt-2">\n`;
        if (level === "p") {
          jsx += `          <p className="text-sm text-muted-foreground">${el.label}</p>\n`;
        } else {
          jsx += `          <${level} className="${sizeClass} text-foreground">${el.label}</${level}>\n`;
        }
        if (el.description) {
          jsx += `          <p className="text-xs text-muted-foreground mt-1">${el.description}</p>\n`;
        }
        jsx += `        </div>\n`;
        return;
      }

      if (el.type === "button") {
        const btnHeight = size === "sm" ? "h-8 text-xs px-3 py-1"
          : size === "lg" ? "h-11 text-base px-8 py-3"
            : "h-9 text-sm px-4 py-2";
        jsx += `        <div className="${colSpan} pt-2">\n`;
        jsx += `          <Button type="submit" className="w-full ${btnHeight} bg-primary text-primary-foreground hover:bg-primary/95 shadow-md rounded-lg font-medium transition-all duration-150">${el.label}</Button>\n`;
        jsx += `        </div>\n`;
        return;
      }

      const inputHeight = size === "sm" ? "h-8 text-xs py-1 px-2.5"
        : size === "lg" ? "h-11 text-base py-2.5 px-4"
          : "h-9 text-sm py-1.5 px-3";

      const textareaHeight = size === "sm" ? "min-h-[50px] text-xs py-1 px-2.5"
        : size === "lg" ? "min-h-[140px] text-base py-2.5 px-4"
          : "min-h-[80px] text-sm py-1.5 px-3";

      jsx += `        <div className="${colSpan}">\n`;
      jsx += `          <FormField\n`;
      jsx += `            control={form.control}\n`;
      jsx += `            name="${el.name}"\n`;
      jsx += `            render={({ field }) => (\n`;
      jsx += `              <FormItem className="space-y-1.5 py-1">\n`;
      jsx += `                <div className="flex items-center gap-1">\n`;
      jsx += `                  <FormLabel>${el.label}</FormLabel>\n`;
      if (el.required) {
        jsx += `                  <span className="text-destructive font-bold">*</span>\n`;
      }
      jsx += `                </div>\n`;
      jsx += `                <FormControl>\n`;

      if (el.type === "input") {
        jsx += `                  <Input placeholder="${el.placeholder || ""}" {...field} className="bg-transparent border border-input rounded-md px-3 ${inputHeight}" />\n`;
      } else if (el.type === "textarea") {
        jsx += `                  <Textarea placeholder="${el.placeholder || ""}" {...field} className="bg-transparent border border-input rounded-md px-3 ${textareaHeight}" />\n`;
      } else if (el.type === "select") {
        jsx += `                  <Select onValueChange={field.onChange} defaultValue={field.value}>\n`;
        jsx += `                    <SelectTrigger className="w-full bg-transparent border border-input rounded-md px-3 ${inputHeight} flex items-center justify-between">\n`;
        jsx += `                      <SelectValue placeholder="${el.placeholder || "Select option"}" />\n`;
        jsx += `                    </SelectTrigger>\n`;
        jsx += `                    <SelectContent className="border border-border bg-card shadow-lg rounded-md p-1">\n`;
        el.options?.forEach((opt) => {
          jsx += `                      <SelectItem value="${opt.value}" className="text-xs hover:bg-accent px-2 py-1 rounded cursor-pointer">${opt.label}</SelectItem>\n`;
        });
        jsx += `                    </SelectContent>\n`;
        jsx += `                  </Select>\n`;
      } else if (el.type === "checkbox") {
        jsx += `                  <div className="flex items-center gap-2">\n`;
        jsx += `                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />\n`;
        jsx += `                    <span className="text-xs text-muted-foreground">${el.placeholder || ""}</span>\n`;
        jsx += `                  </div>\n`;
      } else if (el.type === "switch") {
        jsx += `                  <div className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-border/40">\n`;
        jsx += `                    <span className="text-xs text-muted-foreground">${el.placeholder || "Enable options"}</span>\n`;
        jsx += `                    <Switch checked={field.value} onCheckedChange={field.onChange} />\n`;
        jsx += `                  </div>\n`;
      } else if (el.type === "otp") {
        jsx += `                  <InputOTP maxLength={${el.otpLength || 6}} value={field.value} onChange={field.onChange}>\n`;
        jsx += `                    <InputOTPGroup className="flex gap-1.5 justify-center">\n`;
        for (let i = 0; i < (el.otpLength || 6); i++) {
          jsx += `                      <InputOTPSlot index={${i}} className="w-10 h-10 text-center font-bold border border-input rounded bg-transparent" />\n`;
        }
        jsx += `                    </InputOTPGroup>\n`;
        jsx += `                  </InputOTP>\n`;
      } else if (el.type === "calendar") {
        jsx += `                  <Popover>\n`;
        jsx += `                    <PopoverTrigger asChild>\n`;
        jsx += `                      <Button variant="outline" className="w-full text-left font-normal flex justify-between bg-transparent border border-input rounded-md px-3 ${inputHeight}">\n`;
        jsx += `                        {field.value ? field.value.toLocaleDateString() : "${el.placeholder || "Pick a date"}"}\n`;
        jsx += `                        <CalendarIcon className="h-4 w-4 opacity-50" />\n`;
        jsx += `                      </Button>\n`;
        jsx += `                    </PopoverTrigger>\n`;
        jsx += `                    <PopoverContent className="w-auto p-0 border border-border bg-card shadow-lg rounded-md" align="start">\n`;
        jsx += `                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="rounded-md" />\n`;
        jsx += `                    </PopoverContent>\n`;
        jsx += `                  </Popover>\n`;
      } else if (el.type === "file-upload") {
        jsx += `                  <FileUploader\n`;
        jsx += `                    value={field.value}\n`;
        jsx += `                    onChange={field.onChange}\n`;
        jsx += `                    maxSize={${el.validation?.fileMaxSize || 5}}\n`;
        jsx += `                    allowedTypes={${JSON.stringify(el.validation?.fileTypes || [])}}\n`;
        jsx += `                    placeholder="${el.placeholder || "Drag & drop files here"}"\n`;
        jsx += `                  />\n`;
      }

      jsx += `                </FormControl>\n`;
      if (el.description) {
        jsx += `                <FormDescription className="text-[10px] text-muted-foreground/80">${el.description}</FormDescription>\n`;
      }
      jsx += `                <FormMessage className="text-xs text-destructive font-semibold" />\n`;
      jsx += `              </FormItem>\n`;
      jsx += `            )}\n`;
      jsx += `          />\n`;
      jsx += `        </div>\n`;
    });
    return jsx;
  };

  // Generate the full Next.js/React component string
  const generateComponentCode = (): string => {
    const hasSelect = elements.some((el) => el.type === "select");
    const hasCheckbox = elements.some((el) => el.type === "checkbox");
    const hasSwitch = elements.some((el) => el.type === "switch");
    const hasOtp = elements.some((el) => el.type === "otp");
    const hasCalendar = elements.some((el) => el.type === "calendar");
    const hasFileUpload = elements.some((el) => el.type === "file-upload");

    return `"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";${hasSelect
        ? `\nimport {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from "@/components/ui/select";`
        : ""
      }${hasCheckbox ? `\nimport { Checkbox } from "@/components/ui/checkbox";` : ""}${hasSwitch ? `\nimport { Switch } from "@/components/ui/switch";` : ""
      }${hasOtp
        ? `\nimport {\n  InputOTP,\n  InputOTPGroup,\n  InputOTPSlot,\n} from "@/components/ui/input-otp";`
        : ""
      }${hasCalendar
        ? `\nimport { Calendar } from "@/components/ui/calendar";\nimport { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\nimport { CalendarIcon } from "lucide-react";`
        : ""
      }${hasFileUpload ? `\nimport { FileUploader } from "@/components/ui/file-uploader";` : ""}

// Validation Schema
${generateZodSchema()}

export default function RenderedForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: ${generateDefaultValues()},
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("Form Values:", values);
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-x-4 gap-y-4 max-w-lg mx-auto p-6 rounded-lg border border-border bg-card shadow-sm">
${generateJSXFields()}
      </form>
    </Form>
  );
}
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateComponentCode());
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJsonSchema = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportSchema());
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "form-schema.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    setImportError("");
    const result = importSchema(importJson);
    if (result.success) {
      setIsImporting(false);
      setImportJson("");
      triggerConfetti();
    } else {
      setImportError(result.error || "Failed to parse JSON schema.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
              Form Code Generator
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Get standard Shadcn + React Hook Form + Zod code.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Import JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-1.5 h-8 text-xs border border-border bg-transparent hover:bg-secondary/40"
          >
            <FileJson className="h-3.5 w-3.5" />
            Import
          </Button>

          {/* Export JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadJsonSchema}
            className="flex items-center gap-1.5 h-8 text-xs border border-border bg-transparent hover:bg-secondary/40"
            title="Download JSON Schema"
          >
            <Download className="h-3.5 w-3.5" />
            Export Schema
          </Button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 min-h-[300px] rounded-lg border border-border/80 bg-black/45 glass-panel flex flex-col overflow-hidden relative">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-secondary/20">
          <span className="text-[10px] font-mono text-muted-foreground">
            src/components/forms/custom-form.tsx
          </span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-[10px] bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer active:scale-95 duration-100"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* Highlighted Code Area */}
        <div className="flex-1 p-4 overflow-auto font-mono text-xs text-muted-foreground leading-relaxed select-text select-all whitespace-pre tab-size-2">
          <code className="block text-[11px] text-foreground/80 selection:bg-primary/25">
            {generateComponentCode()}
          </code>
        </div>
      </div>

      {/* Import Modal */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md p-6 rounded-xl border border-border bg-card shadow-2xl glass-panel space-y-4">
            <div>
              <h4 className="text-base font-semibold text-foreground">Import Form JSON Schema</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste the exported schema JSON below to restore your form state.
              </p>
            </div>

            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[
  {
    "id": "starter-field",
    "type": "input",
    "label": "My Input",
    "name": "myInput",
    "required": true
  }
]'
              className="font-mono text-xs min-h-[160px] bg-black/20"
            />

            {importError && (
              <p className="text-xs text-destructive font-semibold">
                Error: {importError}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsImporting(false);
                  setImportJson("");
                  setImportError("");
                }}
                className="h-8"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleImport} className="h-8">
                Load Schema
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
