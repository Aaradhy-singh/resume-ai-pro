import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PortfolioSettingsCardsProps {
  portfolioUrl: string;
  onPortfolioUrlChange: (url: string) => void;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (level: string) => void;
}

export function PortfolioSettingsCards({
  portfolioUrl,
  onPortfolioUrlChange,
  targetRole,
  onTargetRoleChange,
  experienceLevel,
  onExperienceLevelChange,
}: PortfolioSettingsCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] shadow-none"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6 pb-2">
          <div className="font-[var(--font-body)] text-[13px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
            Portfolio
          </div>
          <div className="font-[var(--font-body)] text-[11px] text-[var(--text-secondary)] mt-1">
            Add your portfolio or GitHub link
          </div>
        </div>
        <div className="p-6 pt-4">
          <Input
            placeholder="https://github.com/username"
            value={portfolioUrl}
            onChange={(e) => onPortfolioUrlChange(e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-0 focus-visible:border-[var(--accent)] shadow-none h-auto py-2"
          />
        </div>
      </div>

      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] shadow-none"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6 pb-2">
          <div className="font-[var(--font-body)] text-[13px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
            Analysis Settings
          </div>
          <div className="font-[var(--font-body)] text-[11px] text-[var(--text-secondary)] mt-1">
            Configure your target role
          </div>
        </div>
        <div className="p-6 pt-4 space-y-3">
          <Select value={targetRole} onValueChange={onTargetRoleChange}>
            <SelectTrigger className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)] focus:ring-0 focus:border-[var(--accent)] shadow-none h-auto py-2">
              <SelectValue placeholder="Select target role" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)]">
              <SelectItem value="frontend">Frontend Developer</SelectItem>
              <SelectItem value="backend">Backend Developer</SelectItem>
              <SelectItem value="fullstack">Full Stack Developer</SelectItem>
              <SelectItem value="data">Data Scientist</SelectItem>
              <SelectItem value="devops">DevOps Engineer</SelectItem>
              <SelectItem value="product">Product Manager</SelectItem>
              <SelectItem value="design">UX/UI Designer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={experienceLevel} onValueChange={onExperienceLevelChange}>
            <SelectTrigger className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)] focus:ring-0 focus:border-[var(--accent)] shadow-none h-auto py-2">
              <SelectValue placeholder="Experience level" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-none font-[var(--font-body)] text-[12px] text-[var(--text-primary)]">
              <SelectItem value="entry">Entry Level (0–2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (3–5 years)</SelectItem>
              <SelectItem value="senior">Senior (6–10 years)</SelectItem>
              <SelectItem value="lead">Lead / Principal (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
