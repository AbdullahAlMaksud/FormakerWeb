"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ElementType =
  | "input"
  | "textarea"
  | "select"
  | "file-upload"
  | "otp"
  | "calendar"
  | "label"
  | "checkbox"
  | "switch"
  | "radio"
  | "button";

export interface FormElement {
  id: string;
  type: ElementType;
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
  options?: { label: string; value: string }[]; // For Select, Radio Group
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "p"; // For Label component
  otpLength?: 4 | 6; // For OTP Input
  width?: "1/4" | "1/3" | "1/2" | "full";
  height?: "sm" | "md" | "lg";
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    fileMaxSize?: number; // In MB
    fileTypes?: string[]; // e.g. ["image/*", ".pdf"]
  };
}

interface FormBuilderContextType {
  elements: FormElement[];
  selectedElementId: string | null;
  addElement: (type: ElementType, index?: number) => string;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<FormElement>) => void;
  setSelectedElementId: (id: string | null) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  duplicateElement: (id: string) => void;
  clearCanvas: () => void;
  importSchema: (schemaJson: string) => { success: boolean; error?: string };
  exportSchema: () => string;
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

const DEFAULT_LABEL_MAP: Record<ElementType, string> = {
  input: "Text Input",
  textarea: "Text Area",
  select: "Select Dropdown",
  "file-upload": "File Upload",
  otp: "One-Time Password (OTP)",
  calendar: "Date Picker",
  label: "Section Title / Label",
  checkbox: "Checkbox Option",
  switch: "Switch Toggle",
  radio: "Radio Options Group",
  button: "Submit Button",
};

export const FormBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Load initial template if empty, or try to load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("form_builder_state");
    if (saved) {
      try {
        setElements(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved form builder state", e);
      }
    } else {
      // Load a friendly default starter form
      const starterForm: FormElement[] = [
        {
          id: "label-starter",
          type: "label",
          label: "Contact Information Form",
          name: "form_header",
          headingLevel: "h2",
          required: false,
          description: "Please fill out your details below.",
          width: "full",
          height: "md",
        },
        {
          id: "name-starter",
          type: "input",
          label: "Full Name",
          name: "fullName",
          placeholder: "John Doe",
          required: true,
          width: "1/2",
          height: "md",
        },
        {
          id: "email-starter",
          type: "input",
          label: "Email Address",
          name: "email",
          placeholder: "john@example.com",
          required: true,
          validation: {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          },
          width: "1/2",
          height: "md",
        },
        {
          id: "message-starter",
          type: "textarea",
          label: "Your Message",
          name: "message",
          placeholder: "Type your message here...",
          required: false,
          width: "full",
          height: "md",
        },
        {
          id: "submit-starter",
          type: "button",
          label: "Send Message",
          name: "submit_btn",
          required: false,
          width: "full",
          height: "lg",
        },
      ];
      setElements(starterForm);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem("form_builder_state", JSON.stringify(elements));
    } else {
      localStorage.removeItem("form_builder_state");
    }
  }, [elements]);

  const addElement = (type: ElementType, index?: number): string => {
    const id = `${type}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Create base clean name key (e.g. textInput_1)
    const count = elements.filter((el) => el.type === type).length + 1;
    const cleanName = `${type.replace("-", "")}_${count}`;

    const newElement: FormElement = {
      id,
      type,
      label: DEFAULT_LABEL_MAP[type],
      name: cleanName,
      required: false,
      width: "full",
      height: "md",
    };

    // Set some defaults based on type
    if (type === "select" || type === "radio") {
      newElement.options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
        { label: "Option 3", value: "option3" },
      ];
    } else if (type === "otp") {
      newElement.otpLength = 6;
      newElement.placeholder = "○";
    } else if (type === "label") {
      newElement.headingLevel = "h3";
    } else if (type === "button") {
      newElement.label = "Submit";
    } else if (type === "input") {
      newElement.placeholder = "Enter value...";
    } else if (type === "textarea") {
      newElement.placeholder = "Enter description...";
    } else if (type === "file-upload") {
      newElement.validation = {
        fileMaxSize: 5, // 5MB default
        fileTypes: ["image/*", ".pdf", ".docx"],
      };
    }

    setElements((prev) => {
      const updated = [...prev];
      if (index !== undefined) {
        updated.splice(index, 0, newElement);
      } else {
        updated.push(newElement);
      }
      return updated;
    });

    setSelectedElementId(id);
    return id;
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const reorderElements = (startIndex: number, endIndex: number) => {
    setElements((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const duplicateElement = (id: string) => {
    const sourceEl = elements.find((el) => el.id === id);
    if (!sourceEl) return;

    const newId = `${sourceEl.type}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    const newName = `${sourceEl.name}_copy`;

    const duplicated: FormElement = {
      ...JSON.parse(JSON.stringify(sourceEl)),
      id: newId,
      name: newName,
    };

    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      const result = [...prev];
      result.splice(idx + 1, 0, duplicated);
      return result;
    });
    setSelectedElementId(newId);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElementId(null);
  };

  const importSchema = (schemaJson: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(schemaJson);
      if (!Array.isArray(parsed)) {
        return { success: false, error: "Schema must be an array of form elements." };
      }

      // Basic validation of fields
      for (const item of parsed) {
        if (!item.id || !item.type || !item.label || !item.name) {
          return { success: false, error: "Invalid element in schema. All elements require 'id', 'type', 'label', and 'name'." };
        }
      }

      setElements(parsed);
      setSelectedElementId(parsed[0]?.id || null);
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Invalid JSON string." };
    }
  };

  const exportSchema = (): string => {
    return JSON.stringify(elements, null, 2);
  };

  return (
    <FormBuilderContext.Provider
      value={{
        elements,
        selectedElementId,
        addElement,
        removeElement,
        updateElement,
        setSelectedElementId,
        reorderElements,
        duplicateElement,
        clearCanvas,
        importSchema,
        exportSchema,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error("useFormBuilder must be used within a FormBuilderProvider");
  }
  return context;
};
