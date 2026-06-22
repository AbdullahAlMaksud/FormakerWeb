"use client";

import * as React from "react";
import { cn } from "./button";
import { UploadCloud, File, X } from "lucide-react";

export interface FileUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  placeholder?: string;
  error?: boolean;
}

export function FileUpload({
  value = [],
  onChange,
  maxSize = 5,
  allowedTypes = [],
  placeholder = "Drag & drop your files here, or click to browse",
  error,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const maxBytes = maxSize * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check size
      if (file.size > maxBytes) {
        alert(`File ${file.name} exceeds the ${maxSize}MB limit.`);
        continue;
      }

      // Check type if specified
      if (allowedTypes.length > 0) {
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isMimeMatch = allowedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", ""));
          }
          return file.type === type || type.toLowerCase() === fileExt;
        });

        if (!isMimeMatch) {
          alert(`File type not allowed. Supported types: ${allowedTypes.join(", ")}`);
          continue;
        }
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0 && onChange) {
        onChange([...value, ...valid]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0 && onChange) {
        onChange([...value, ...valid]);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    if (onChange) {
      onChange(updated);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed border-input rounded-lg p-6 bg-transparent hover:bg-secondary/20 cursor-pointer transition-all min-h-[120px] text-center gap-2 select-none",
          isDragActive && "border-primary bg-primary/5 scale-[0.99]",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept={allowedTypes.join(",")}
        />
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm font-medium text-muted-foreground">
          {placeholder}
        </div>
        <div className="text-xs text-muted-foreground/60">
          Max file size: {maxSize}MB. Supported: {allowedTypes.length > 0 ? allowedTypes.join(", ") : "All files"}
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {value.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-md bg-secondary/40 border border-border text-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <File className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-xs">{file.name}</span>
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary rounded flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
