import { useCallback, useState } from "react";
import { uploadFile } from "../api/client";
import type { UploadResponse } from "../types";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface Props {
  onSuccess: (data: UploadResponse) => void;
}

export default function UploadZone({ onSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processFile = useCallback(
    async (file: File) => {
      setError("");
      setLoading(true);
      try {
        const data = await uploadFile(file);
        onSuccess(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="w-full max-w-lg animate-slide-up">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300
          ${
            dragging
              ? "border-accent bg-accent/10 scale-[1.02]"
              : "border-surface-border bg-surface hover:border-accent/50 hover:bg-surface-hover"
          }
          ${loading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-300 text-sm font-medium">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                dragging ? "bg-accent/30" : "bg-surface-hover"
              }`}
            >
              {dragging ? (
                <FileSpreadsheet className="text-accent" size={24} />
              ) : (
                <Upload className="text-gray-400" size={24} />
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-200 text-sm font-medium">
                {dragging ? "Drop your file here" : "Drag & drop your dataset"}
              </p>
              <p className="text-gray-500 text-xs mt-1.5">
                or click to browse · CSV, Excel, JSON · up to 50 MB
              </p>
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm animate-fade-in bg-red-500/10 px-4 py-3 rounded-xl">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
