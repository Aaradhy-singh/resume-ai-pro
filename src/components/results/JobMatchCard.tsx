import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";
import type { RoleMatch } from "@/lib/engines/weighted-role-matcher";
import type { RoleSeniority } from "@/lib/engines/role-seniority-filter";

interface JobMatchCardProps {
  match: RoleMatch;
  fitLevel?: 'perfect' | 'reach' | 'stretch' | 'mismatch';
  roleSeniority?: RoleSeniority;
}

export function JobMatchCard({ match, fitLevel, roleSeniority }: JobMatchCardProps) {
  // Determine fit badge color/text
  const getFitBadge = () => {
    if (!fitLevel) return null;
    const config = {
      perfect: { label: "Best Fit", background: "#051A0A", border: "1px solid #103A1A", color: "#10B981" },
      reach: { label: "Near Fit", background: "#1A1505", border: "1px solid #3A2A10", color: "#F59E0B" },
      stretch: { label: "Ambitious Stretch", background: "#1A1505", border: "1px solid #3A2A10", color: "#F59E0B" },
      mismatch: { label: "Role Mismatch", background: "#1A0505", border: "1px solid #3A1010", color: "#EF4444" },
    };
    const c = config[fitLevel];
    return <Badge style={{ borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: c.background, border: c.border, color: c.color }}>{c.label}</Badge>;
  };

  const getSeniorityBadge = () => {
    if (!roleSeniority) return null;
    let label = `${roleSeniority} Level`;
    let bg = '#0A0A1A', border = '1px solid #1A1A3A', color = '#8B5CF6';
    if (roleSeniority !== 'intern') {
      bg = '#0A0A1A'; border = '1px solid #1A1A3A'; color = '#8B5CF6';
    }
    return <Badge style={{ borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: bg, border: border, color: color }}>{label}</Badge>;
  };

  return (
    <Card className="h-full border-t-4 border-t-primary" style={{ borderRadius: 0, background: '#0D0D0D' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Top Role Match
            </CardTitle>
            <CardDescription className="font-semibold text-foreground mt-1 text-base">
              {match.occupation.title}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getFitBadge()}
            {getSeniorityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Match Score */}
        <div className="flex items-end items-baseline mb-6 border-b pb-4">
          <span className="text-4xl font-bold text-primary mr-2">
            {match.matchScore}%
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            Match Confidence
          </span>
        </div>

        {/* Scoring Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Target className="w-4 h-4 text-blue-500" />
                Core Skills
              </span>
              <span className="font-semibold">{match.matchScore}%</span>
            </div>
            <Progress value={match.matchScore} className="h-2 rounded-none" />
            <p className="text-xs text-muted-foreground">
              {match.missingCrucialSkills.length === 0
                ? "All core skills matched!"
                : `Missing: ${match.missingCrucialSkills.slice(0, 3).join(", ")}`}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Specialized Skills
              </span>
              <span className="font-semibold">{match.matchScore}%</span>
            </div>
            <Progress value={match.matchScore} className="h-2 rounded-none" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-purple-500" />
                Career Adjacency
              </span>
              <span className="font-semibold">{match.matchScore}%</span>
            </div>
            <Progress value={match.matchScore} className="h-2 rounded-none" />
          </div>
        </div>

        {/* Missing Critical Skills */}
        {match.missingCrucialSkills.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.08)', padding: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              Critical Gaps
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {match.missingCrucialSkills.slice(0, 5).map(skill => (
                <Badge key={skill} style={{ background: '#1A0505', border: '1px solid #3A1010', color: '#EF4444', borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>
                  {skill}
                </Badge>
              ))}
              {match.missingCrucialSkills.length > 5 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{match.missingCrucialSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
