import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResumeUploadCardProps {
  resumeText: string;
  onResumeTextChange: (text: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
}

export function ResumeUploadCard({
  resumeText,
  onResumeTextChange,
  fileName,
  onFileNameChange,
}: ResumeUploadCardProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileNameChange(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileNameChange(e.target.files[0].name);
    }
  };

  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border)] shadow-none"
      style={{ borderRadius: 0 }}
    >
      <div className="p-6 pb-2">
        <div className="font-[var(--font-body)] text-[13px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
          Upload Your Resume
        </div>
        <div className="font-[var(--font-body)] text-[11px] text-[var(--text-secondary)] mt-1">
          Upload your resume or paste the content below
        </div>
      </div>
      <div className="p-6 pt-4 space-y-4">
        <div
          className={`border border-dashed bg-[var(--bg-primary)] p-8 text-center transition-colors cursor-pointer ${dragActive
              ? "border-[var(--accent)]"
              : "border-[var(--border)] hover:border-[var(--accent)]"
            }`}
          style={{ borderRadius: 0 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="font-[var(--font-body)] text-[11px] tracking-[0.15em] text-[var(--text-muted)] mb-3">
            [ DROP FILE ]
          </div>
          {fileName ? (
            <p className="font-[var(--font-body)] text-[13px] text-[var(--accent)]">
              ✓ {fileName}
            </p>
          ) : (
            <>
              <p className="font-[var(--font-body)] text-[13px] text-[var(--text-secondary)]">
                Drop your resume here
              </p>
              <p className="font-[var(--font-body)] text-[11px] text-[var(--text-muted)] mt-1">
                PDF or DOCX, up to 10MB
              </p>
            </>
          )}
          <label className="mt-3 inline-block">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer bg-transparent border border-[var(--border)] text-[var(--text-secondary)] font-[var(--font-body)] text-[11px] uppercase tracking-[0.08em] rounded-none hover:border-[var(--accent)] hover:text-[var(--text-primary)] hover:bg-transparent shadow-none h-auto py-2 px-4"
              asChild
            >
              <span>Browse Files</span>
            </Button>
          </label>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center">
            <span
              className="font-[var(--font-body)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] px-3"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              or paste your resume
            </span>
          </div>
        </div>

        <Textarea
          placeholder="Paste your resume content here..."
          className="min-h-[120px] bg-[var(--bg-primary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-0 focus-visible:border-[var(--accent)] resize-y shadow-none"
          value={resumeText}
          onChange={(e) => onResumeTextChange(e.target.value)}
        />
      </div>
    </div>
  );
}
