"use client";

import { useRef, DragEvent, useState } from "react";
import { Upload, FileJson } from "lucide-react";

interface FileUploadProps {
  label: string;
  description: string;
  fileName: string | null;
  onFile: (file: File) => void;
  accept?: string;
}

export default function FileUpload({
  label,
  description,
  fileName,
  onFile,
  accept = ".json",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-pink-500 bg-pink-50"
          : fileName
          ? "border-green-400 bg-green-50"
          : "border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        {fileName ? (
          <FileJson className="w-8 h-8 text-green-500" />
        ) : (
          <Upload className="w-8 h-8 text-gray-400" />
        )}
        <p className="font-semibold text-gray-700">{label}</p>
        {fileName ? (
          <p className="text-sm text-green-600 font-medium truncate max-w-[200px]">{fileName}</p>
        ) : (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
