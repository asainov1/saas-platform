"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export function FileUpload({
  onUpload,
  accept,
  multiple = false,
  label = "Перетащите файлы сюда или нажмите для выбора",
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onUpload(multiple ? files : [files[0]]);
    },
    [onUpload, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onUpload(files);
      e.target.value = "";
    },
    [onUpload]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
        dragOver
          ? "border-violet-500 bg-violet-600/5"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <Upload className="h-6 w-6 text-zinc-500" />
      <p className="text-sm text-zinc-500 text-center">{label}</p>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
