import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import type { TransparentJDAlignmentScore } from "@/lib/engines/ats-scoring-engine";

interface JDAlignmentScoreCardProps {
  score: TransparentJDAlignmentScore | null;
}

const getScoreColorHex = (score: number) => {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#0EA5E9";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
};

export function JDAlignmentScoreCard({ score }: JDAlignmentScoreCardProps) {
  // score.overall is null when no JD provided — 
  // default to 0 so the animation starts correctly
  const overallScore = score?.overallScore ?? 0;

  // Handle loading/null state
  if (!score) return null;

  // Map factors to display format
  // We dynamically render whatever factors are present in the score
  const displayFactors = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: CheckCircle2 },
    { key: 'skillDensity', label: 'Skill Density', icon: Shield },
    { key: 'sectionCompleteness', label: 'Sections', icon: Info },
    { key: 'actionVerbStrength', label: 'Action Verbs', icon: CheckCircle2 },
    { key: 'quantificationPresence', label: 'Quantification', icon: Shield },
    { key: 'projectQuality', label: 'Project Quality', icon: Shield },
    { key: 'experienceDepth', label: 'Experience', icon: Shield },
    { key: 'leadership', label: 'Leadership', icon: Shield },
  ].map(def => {
    const factor = score.factors[def.key as keyof typeof score.factors];
    return factor ? { ...def, ...factor } : null;
  }).filter(Boolean); // Remove nulls (factors not applicable to this stage)

  return (
    <Card className="h-full" style={{ borderLeft: '4px solid #0EA5E9' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Keyword Coverage Score
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Calibrated for <strong>{score.careerStage || 'General'}</strong> Level
            </CardDescription>
          </div>
          {score.stageAdjusted && (
            <Badge variant="secondary" className="text-[10px]">
              Stage Adjusted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6 mb-6">
          {/* Score Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 352} 352`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ color: getScoreColorHex(score.overallScore) }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold" style={{ color: getScoreColorHex(score.overallScore) }}>
                {overallScore}
              </span>
              <span className="block text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Factor List */}
          <div className="flex-1 space-y-3">
            {displayFactors.map((factor: { key: string; label: string; score: number; computation: string; weight: number }) => (
              <div key={factor.key}>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">{factor.label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground/50" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{factor.computation}</p>
                          <p className="text-xs text-muted-foreground mt-1">Weight: {factor.weight}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{factor.score}</span>
                    <span className="text-[10px] text-muted-foreground">({factor.weight}%)</span>
                  </div>
                </div>
                <Progress value={factor.score} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer/Insight */}
        <div className="bg-muted/50 rounded-lg p-3 flex gap-3 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          {score?.disclaimer && (
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              color: '#6B6B6B',
              lineHeight: 1.7,
              marginTop: '12px',
              padding: '10px 14px',
              background: '#0D0D0D',
              border: '1px solid #1F1F1F',
              borderLeft: '2px solid #3A3A3A'
            }}>
              {score.disclaimer}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
