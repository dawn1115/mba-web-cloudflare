'use client';

import { useState, ChangeEvent } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileInputProps {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
}

export function FileInput({ label, name, accept, multiple, required }: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="grid gap-2 text-sm">
      <span className="text-[color:var(--ink)]">{label}</span>
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-[color:var(--accent)] focus-within:ring-offset-2 ${
          isDragging ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5' : 'border-black/15 bg-white hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          required={required}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
          onChange={handleChange}
        />
        
        <UploadCloud className={`mb-2 h-8 w-8 ${isDragging ? 'text-[color:var(--accent)]' : 'text-gray-400'}`} />
        <div className="text-[color:var(--ink)]">
          <span className="font-medium text-[color:var(--accent)]">点击上传</span> 或拖拽文件到此处
        </div>
        <div className="mt-1 text-xs text-[color:var(--muted)]">
          {accept ? `支持的格式: ${accept}` : '支持任意文件格式'}
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-2 grid gap-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[color:var(--ink)]">
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-[color:var(--muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
