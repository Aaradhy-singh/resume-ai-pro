import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionCardProps {
  jobDescription: string;
  onJobDescriptionChange: (text: string) => void;
}

export function JobDescriptionCard({ jobDescription, onJobDescriptionChange }: JobDescriptionCardProps) {
  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border)] shadow-none"
      style={{ borderRadius: 0 }}
    >
      <div className="p-6 pb-2">
        <div className="font-[var(--font-body)] text-[13px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
          Job Description
        </div>
        <div className="font-[var(--font-body)] text-[11px] text-[var(--text-secondary)] mt-1">
          Paste the target job description for matching analysis
        </div>
      </div>
      <div className="p-6 pt-4">
        <Textarea
          placeholder="Paste the job description here..."
          className="min-h-[150px] bg-[var(--bg-primary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-0 focus-visible:border-[var(--accent)] resize-y shadow-none"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
