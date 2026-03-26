"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageProvider";

interface UploadAreaProps {
  onFileUpload: (
    fileContent: string,
    fileName: string,
    fileSize: string,
  ) => void;
}

export default function UploadArea({ onFileUpload }: UploadAreaProps) {
  const language = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith(".csv")) {
      setError(t(language, "upload.accept"));
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(t(language, "upload.accept"));
      return false;
    }
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return t(language, "upload.size.0bytes");
    const k = 1024;
    const sizes = [
      t(language, "upload.size.bytes"),
      t(language, "upload.size.kb"),
      t(language, "upload.size.mb"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileRead = (file: File) => {
    setError(null);
    const size = formatFileSize(file.size);
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content, file.name, size);
    };
    reader.onerror = () => {
      setError(t(language, "upload.failed"));
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative rounded-lg border-2 border-dashed cursor-pointer transition-all",
          "flex items-center justify-center p-8 min-h-48 mb-0",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:bg-muted/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
          aria-label={t(language, "upload.aria")}
        />

        <div className="text-center pointer-events-none">
          <Upload
            className={cn(
              "mx-auto h-12 w-12 mb-2 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground",
            )}
          />
          <p className="font-semibold text-foreground">
            {t(language, "upload.drag")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t(language, "upload.or")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t(language, "upload.accept")}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mt-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
