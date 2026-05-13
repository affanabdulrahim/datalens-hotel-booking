import { FormEvent, useRef, useState } from "react";
import { UploadResponse, uploadCsv } from "../api";

interface UploadFormProps {
  onUpload?: (response: UploadResponse) => void;
}

export function UploadForm({ onUpload }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Select a CSV file before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadCsv(selectedFile);
      if (onUpload) {
        onUpload(response);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fadeIn">
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-3xl font-bold text-white">Upload Your Data</h2>
          <p className="mt-2 text-slate-400">
            Upload any CSV file and DataLens will auto-generate visualizations and insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div
            className="rounded-lg border-2 border-dashed border-slate-600 p-8 text-center transition hover:border-slate-500 cursor-pointer"
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                setSelectedFile(files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                  setError(null);
                }
              }}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="space-y-2"
            >
              <div className="text-4xl">📁</div>
              <div className="text-sm text-slate-300">
                {selectedFile ? (
                  <>
                    <p className="font-medium text-cyan-400">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Drag and drop your CSV file</p>
                    <p className="text-xs text-slate-400">or click to browse</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-700/50 bg-red-950/30 p-4 text-sm text-red-400">
              ❌ {error}
            </div>
          )}

          {/* Upload Button */}
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload & Analyze"}
          </button>
        </form>
      </div>
    </div>
  );
}
