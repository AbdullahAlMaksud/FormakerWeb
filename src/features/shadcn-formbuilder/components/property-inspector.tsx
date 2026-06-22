"use client";

import React from "react";
import { useFormBuilder, FormElement } from "@/features/shadcn-formbuilder/context/form-builder-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Plus, Trash2, Settings, HelpCircle, AlertTriangle } from "lucide-react";

export const PropertyInspector: React.FC = () => {
  const { elements, selectedElementId, updateElement, removeElement } = useFormBuilder();

  const activeElement = elements.find((el) => el.id === selectedElementId);

  if (!activeElement) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground select-none bg-background/5 border border-border/40 rounded-xl">
        <Settings className="h-8 w-8 mb-3 opacity-35" />
        <h4 className="text-sm font-semibold text-foreground mb-1">No element selected</h4>
        <p className="text-xs max-w-[200px]">
          Click on any element in the center canvas to adjust its properties.
        </p>
      </div>
    );
  }

  // Handle common changes
  const handleUpdate = (updates: Partial<FormElement>) => {
    if (selectedElementId) {
      updateElement(selectedElementId, updates);
    }
  };

  // Options list modification (for select, radio, checkbox group)
  const addOption = () => {
    const currentOptions = activeElement.options || [];
    const count = currentOptions.length + 1;
    const newOption = { label: `Option ${count}`, value: `option${count}` };
    handleUpdate({ options: [...currentOptions, newOption] });
  };

  const removeOption = (index: number) => {
    const currentOptions = activeElement.options || [];
    if (currentOptions.length <= 1) return; // Keep at least one option
    const updated = [...currentOptions];
    updated.splice(index, 1);
    handleUpdate({ options: updated });
  };

  const updateOption = (index: number, field: "label" | "value", val: string) => {
    const currentOptions = activeElement.options || [];
    const updated = currentOptions.map((opt, i) => {
      if (i === index) {
        return {
          ...opt,
          [field]: val,
          // Sync value automatically from label if value isn't edited manually
          ...(field === "label" && opt.value === opt.label.toLowerCase().replace(/\s+/g, "")
            ? { value: val.toLowerCase().replace(/\s+/g, "") }
            : {}),
        };
      }
      return opt;
    });
    handleUpdate({ options: updated });
  };

  // Safe camelCase field name converter
  const cleanFieldName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9_]/g, "") // Remove bad chars
      .replace(/^[0-9]+/, ""); // Remove leading numbers
  };

  // File extension checkbox helper
  const handleFileTypeToggle = (ext: string) => {
    const currentTypes = activeElement.validation?.fileTypes || [];
    let updatedTypes: string[];

    if (currentTypes.includes(ext)) {
      updatedTypes = currentTypes.filter((t) => t !== ext);
    } else {
      updatedTypes = [...currentTypes, ext];
    }

    handleUpdate({
      validation: {
        ...(activeElement.validation || {}),
        fileTypes: updatedTypes,
      },
    });
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
              Field Settings
            </h3>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono">
            {activeElement.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Customize label, validations, and specific options.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm pb-6">
        {/* FIELD LABEL */}
        <div className="space-y-1.5">
          <Label htmlFor="prop-label">
            {activeElement.type === "label"
              ? "Display Content / Text"
              : activeElement.type === "button"
                ? "Button Label"
                : "Field Label"}
          </Label>
          <Input
            id="prop-label"
            value={activeElement.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="e.g. Email Address"
          />
        </div>

        {/* FIELD KEY (NAME) */}
        {activeElement.type !== "button" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prop-name">Database Field Key</Label>
              <span title="The identifier key in form submission (camelCase)">
                <HelpCircle className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </span>
            </div>
            <Input
              id="prop-name"
              value={activeElement.name}
              onChange={(e) => handleUpdate({ name: cleanFieldName(e.target.value) })}
              placeholder="e.g. emailAddress"
            />
            {activeElement.name.trim() === "" && (
              <span className="text-[10px] text-destructive flex items-center gap-1 font-semibold">
                <AlertTriangle className="h-3 w-3" /> Field name key cannot be empty.
              </span>
            )}
          </div>
        )}

        {/* LAYOUT & SIZING */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Layout & Sizing
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Width */}
            <div className="space-y-1.5">
              <Label htmlFor="prop-width">Field Grid Width</Label>
              <Select
                id="prop-width"
                value={activeElement.width || "full"}
                onChange={(e) =>
                  handleUpdate({ width: e.target.value as any })
                }
              >
                <option value="full">Full Width (100%)</option>
                <option value="1/2">Half Width (50%)</option>
                <option value="1/3">One-Third (33%)</option>
                <option value="1/4">One-Quarter (25%)</option>
              </Select>
            </div>

            {/* Height (if applicable) */}
            {activeElement.type !== "label" && (
              <div className="space-y-1.5">
                <Label htmlFor="prop-height">Field Height/Size</Label>
                <Select
                  id="prop-height"
                  value={activeElement.height || "md"}
                  onChange={(e) =>
                    handleUpdate({ height: e.target.value as any })
                  }
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium (Default)</option>
                  <option value="lg">Large</option>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* PLACEHOLDER */}
        {activeElement.type !== "label" &&
          activeElement.type !== "button" &&
          activeElement.type !== "checkbox" &&
          activeElement.type !== "switch" &&
          activeElement.type !== "radio" && (
            <div className="space-y-1.5">
              <Label htmlFor="prop-placeholder">Placeholder</Label>
              <Input
                id="prop-placeholder"
                value={activeElement.placeholder || ""}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
              />
            </div>
          )}

        {/* DESCRIPTION SUBTEXT */}
        {activeElement.type !== "label" && activeElement.type !== "button" && (
          <div className="space-y-1.5">
            <Label htmlFor="prop-description">Help / Description Text</Label>
            <Textarea
              id="prop-description"
              value={activeElement.description || ""}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Subtext explanation below the field..."
              className="min-h-[50px] text-xs"
            />
          </div>
        )}

        {/* HEADING LEVEL (Label only) */}
        {activeElement.type === "label" && (
          <div className="space-y-1.5">
            <Label htmlFor="prop-heading">Heading Style / Level</Label>
            <Select
              id="prop-heading"
              value={activeElement.headingLevel || "h3"}
              onChange={(e) =>
                handleUpdate({ headingLevel: e.target.value as FormElement["headingLevel"] })
              }
            >
              <option value="h1">Header 1 (Large Title)</option>
              <option value="h2">Header 2 (Medium Title)</option>
              <option value="h3">Header 3 (Small Title)</option>
              <option value="h4">Header 4 (Subheading)</option>
              <option value="p">Paragraph Body Text</option>
            </Select>
          </div>
        )}

        {/* OTP LENGTH (OTP only) */}
        {activeElement.type === "otp" && (
          <div className="space-y-1.5">
            <Label htmlFor="prop-otp-len">OTP Box Length</Label>
            <Select
              id="prop-otp-len"
              value={String(activeElement.otpLength || 6)}
              onChange={(e) =>
                handleUpdate({ otpLength: parseInt(e.target.value, 10) as 4 | 6 })
              }
            >
              <option value="4">4 Digits</option>
              <option value="6">6 Digits</option>
            </Select>
          </div>
        )}

        {/* OPTIONS CREATOR (Select / Radio / Checkbox) */}
        {(activeElement.type === "select" || activeElement.type === "radio") && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label>Options List</Label>
              <button
                type="button"
                onClick={addOption}
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {activeElement.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/20 p-2 rounded-md border border-border/40">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateOption(i, "label", e.target.value)}
                      placeholder={`Option ${i + 1} Label`}
                      className="w-full bg-transparent border-b border-border/60 focus:border-primary text-xs focus:outline-none py-0.5"
                    />
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => updateOption(i, "value", e.target.value)}
                      placeholder={`value_${i + 1}`}
                      className="w-full bg-transparent text-[10px] text-muted-foreground/80 focus:text-foreground focus:outline-none py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={(activeElement.options || []).length <= 1}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-secondary rounded flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILE UPLOAD LIMITATIONS (File Upload only) */}
        {activeElement.type === "file-upload" && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <Label htmlFor="prop-file-size">Max File Size Limit (MB)</Label>
              <Input
                id="prop-file-size"
                type="number"
                min={1}
                max={100}
                value={activeElement.validation?.fileMaxSize || 5}
                onChange={(e) =>
                  handleUpdate({
                    validation: {
                      ...(activeElement.validation || {}),
                      fileMaxSize: parseInt(e.target.value, 10) || 5,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Allowed File Formats</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { label: "Images (png, jpg)", ext: "image/*" },
                  { label: "PDF Documents", ext: ".pdf" },
                  { label: "Word Docs (.docx)", ext: ".docx" },
                  { label: "Excel Sheets (.xlsx)", ext: ".xlsx" },
                  { label: "CSV Spreadsheets", ext: ".csv" },
                  { label: "ZIP Archives", ext: ".zip" },
                ].map((type) => {
                  const isChecked = (activeElement.validation?.fileTypes || []).includes(type.ext);
                  return (
                    <label
                      key={type.ext}
                      className="flex items-center gap-2 p-2 rounded bg-secondary/15 hover:bg-secondary/35 cursor-pointer border border-border/20 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFileTypeToggle(type.ext)}
                        className="h-3.5 w-3.5 rounded border-gray-600 text-primary focus:ring-primary accent-primary"
                      />
                      <span className="truncate">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* INPUT VALIDATION PRESETS (Input only) */}
        {activeElement.type === "input" && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <Label htmlFor="prop-pattern">Format Validation Rule</Label>
              <Select
                id="prop-pattern"
                value={
                  activeElement.validation?.pattern === "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                    ? "email"
                    : activeElement.validation?.pattern === "^\\+?[0-9]{10,14}$"
                      ? "phone"
                      : activeElement.validation?.pattern === "^https?:\\/\\/[^\\s/$.?#].[^\\s]*$"
                        ? "url"
                        : activeElement.validation?.pattern === "^[0-9]+$"
                          ? "numeric"
                          : activeElement.validation?.pattern
                            ? "custom"
                            : "none"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  let regex = "";
                  if (val === "email") regex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
                  else if (val === "phone") regex = "^\\+?[0-9]{10,14}$";
                  else if (val === "url") regex = "^https?:\\/\\/[^\\s/$.?#].[^\\s]*$";
                  else if (val === "numeric") regex = "^[0-9]+$";
                  else if (val === "custom") regex = activeElement.validation?.pattern || "";

                  handleUpdate({
                    validation: {
                      ...(activeElement.validation || {}),
                      pattern: regex || undefined,
                    },
                  });
                }}
              >
                <option value="none">No Validation Rule</option>
                <option value="email">Valid Email Address</option>
                <option value="phone">Phone Number (+1234567890)</option>
                <option value="url">Web URL (http/https)</option>
                <option value="numeric">Numbers Only</option>
                <option value="custom">Custom Regex Pattern</option>
              </Select>
            </div>

            {/* Custom regex input if active */}
            {activeElement.validation?.pattern &&
              !["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "^\\+?[0-9]{10,14}$", "^https?:\\/\\/[^\\s/$.?#].[^\\s]*$", "^[0-9]+$"].includes(
                activeElement.validation.pattern
              ) && (
                <div className="space-y-1">
                  <Label htmlFor="prop-custom-regex" className="text-[11px] text-muted-foreground">
                    Custom Regular Expression Pattern
                  </Label>
                  <Input
                    id="prop-custom-regex"
                    value={activeElement.validation.pattern}
                    onChange={(e) =>
                      handleUpdate({
                        validation: {
                          ...(activeElement.validation || {}),
                          pattern: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. ^[a-zA-Z]+$"
                    className="font-mono text-xs h-8"
                  />
                </div>
              )}
          </div>
        )}

        {/* DEFAULT VALUE (Checkbox / Switch / Inputs) */}
        {(activeElement.type === "checkbox" || activeElement.type === "switch") && (
          <div className="flex items-center justify-between p-2 rounded bg-secondary/15 border border-border/30 pt-2">
            <Label htmlFor="prop-def-val" className="text-xs">Checked by Default</Label>
            <Switch
              id="prop-def-val"
              checked={activeElement.defaultValue === "true"}
              onCheckedChange={(checked) =>
                handleUpdate({ defaultValue: checked ? "true" : "false" })
              }
            />
          </div>
        )}

        {/* REQUIRED OPTION (Except button / label) */}
        {activeElement.type !== "label" && activeElement.type !== "button" && (
          <div className="flex items-center justify-between p-2 rounded bg-secondary/15 border border-border/30 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="prop-required" className="text-xs">Required Field</Label>
              <p className="text-[10px] text-muted-foreground/60 leading-none">Cannot submit form if empty</p>
            </div>
            <Switch
              id="prop-required"
              checked={activeElement.required}
              onCheckedChange={(checked) => handleUpdate({ required: checked })}
            />
          </div>
        )}

        {/* DELETE BTN */}
        <div className="pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={() => removeElement(activeElement.id)}
            className="w-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 font-semibold py-2 rounded-md text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove Field From Form
          </button>
        </div>
      </div>
    </div>
  );
};
