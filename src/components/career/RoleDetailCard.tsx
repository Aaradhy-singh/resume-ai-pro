import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, GitCompare, Minus, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { Occupation, DemandLevel } from "@/lib/occupation-types";

const demandColors: Record<DemandLevel, string> = {
  "very-high": "bg-score-excellent/15 text-score-excellent border-score-excellent/30",
  high: "bg-score-good/15 text-score-good border-score-good/30",
  moderate: "bg-score-warning/15 text-score-warning border-score-warning/30",
  emerging: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  niche: "bg-muted text-muted-foreground border-border",
};

const demandLabels: Record<DemandLevel, string> = {
  "very-high": "Very High Demand",
  high: "High Demand",
  moderate: "Moderate",
  emerging: "Emerging",
  niche: "Niche",
};

const levelLabels: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
};

const formatINR = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

interface RoleDetailCardProps {
  role: Occupation;
  expanded?: boolean;
  isSelected?: boolean;
  isInComparison?: boolean;
  readinessScore?: number;
  onSelect?: () => void;
  onAddToCompare?: () => void;
  onRemoveFromCompare?: () => void;
}

export function RoleDetailCard({
  role,
  expanded = false,
  isSelected,
  isInComparison,
  readinessScore,
  onSelect,
  onAddToCompare,
  onRemoveFromCompare,
}: RoleDetailCardProps) {
  if (!expanded) {
    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/30"
          }`}
        onClick={onSelect}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{role.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{role.subcategory}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {role.isFutureReady && <Sparkles className="h-3.5 w-3.5 text-chart-4" />}
              {role.isHybrid && <Zap className="h-3.5 w-3.5 text-accent" />}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {levelLabels[role.level] || role.level}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${demandColors[role.demandLevel]}`}>
              {demandLabels[role.demandLevel]}
            </Badge>
          </div>

          {readinessScore !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Resume Readiness</span>
                <span className="font-medium">{readinessScore}%</span>
              </div>
              <Progress value={readinessScore} className="h-1.5" />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {role.coreSkills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
            {role.coreSkills.length > 4 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{role.coreSkills.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5 pt-1">
            {isInComparison ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1"
                onClick={(e) => { e.stopPropagation(); onRemoveFromCompare?.(); }}
              >
                <Minus className="h-3 w-3 mr-1" /> Remove
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1"
                onClick={(e) => { e.stopPropagation(); onAddToCompare?.(); }}
              >
                <GitCompare className="h-3 w-3 mr-1" /> Compare
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded detail view
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{role.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onSelect} className="shrink-0">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          <Badge variant="outline">{levelLabels[role.level]}</Badge>
          <Badge variant="outline" className={`border ${demandColors[role.demandLevel]}`}>
            {demandLabels[role.demandLevel]}
          </Badge>
          {role.isFutureReady && (
            <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/30 border">
              <Sparkles className="h-3 w-3 mr-1" /> Future-Ready
            </Badge>
          )}
          {role.isHybrid && (
            <Badge className="bg-accent/15 text-accent border-accent/30 border">
              <Zap className="h-3 w-3 mr-1" /> Hybrid: {role.hybridDomains?.join(" + ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Core Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {role.coreSkills.map((s) => (
                <Badge key={s} className="bg-primary/10 text-primary border-primary/20 border text-xs">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Secondary Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {role.secondarySkills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-1.5">
              {role.tools.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Resume Keywords</h4>
            <div className="flex flex-wrap gap-1.5">
              {role.resumeKeywords.map((k) => (
                <Badge key={k} variant="outline" className="text-xs border-accent/30 text-accent">{k}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Education Pathways</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {role.educationPaths.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Portfolio Expectations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {role.portfolioExpectations.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Career Progression
            </h4>
            <div className="flex flex-wrap gap-1">
              {role.careerProgression.map((step, i) => (
                <span key={step} className="text-xs">
                  <Badge variant={i === 0 ? "default" : "outline"} className="text-xs">{step}</Badge>
                  {i < role.careerProgression.length - 1 && <span className="text-muted-foreground mx-0.5">→</span>}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Salary Range</h4>
            <p className="text-lg font-semibold text-primary">
              {formatINR(role.salaryBand.min)} – {formatINR(role.salaryBand.max)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/yr</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
