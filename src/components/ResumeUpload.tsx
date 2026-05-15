import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
  onError?: (message: string) => void;
}

const ResumeUpload = ({ onFileSelect, file, onError }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSelectFile = useCallback((selectedFile: File) => {
    // Validate file type
    const isValidType = 
      selectedFile.type === "application/pdf" || 
      selectedFile.type === "text/plain" ||
      selectedFile.name.endsWith(".pdf") ||
      selectedFile.name.endsWith(".txt");
    
    if (!isValidType) {
      onError?.("Unsupported file type. Please upload PDF or TXT files only.");
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      onError?.("File size exceeds 5MB. Please compress your resume.");
      return;
    }
    
    onFileSelect(selectedFile);
  }, [onError, onFileSelect]);
  
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        validateAndSelectFile(droppedFile);
      }
    },
    [validateAndSelectFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSelectFile(selected);
    }
  };

  if (file) {
    return (
      <div className="border border-border bg-card p-5 rounded-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <p className="text-foreground font-medium text-sm truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-dim text-xs mt-0.5">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <button
          onClick={() => onFileSelect(null)}
          className="text-dim hover:text-foreground transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border border-dashed rounded-sm p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground bg-background"
      }`}
      onClick={() => document.getElementById("resume-input")?.click()}
    >
      <Upload className="w-6 h-6 text-dim" />
      <div className="text-center">
        <p className="text-sm text-foreground font-medium">
          Drop your resume here
        </p>
        <p className="text-xs text-dim mt-1">PDF or TXT — max 5MB</p>
      </div>
      <input
        id="resume-input"
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
};

export default ResumeUpload;
