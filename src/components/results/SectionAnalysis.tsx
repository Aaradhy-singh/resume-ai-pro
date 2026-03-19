import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import type { SectionAnalysis as SectionAnalysisType } from "@/lib/types";

interface SectionAnalysisProps {
  data: SectionAnalysisType[];
}

export function SectionAnalysisCard({ data }: SectionAnalysisProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Resume Section Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((section) => (
          <div key={section.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{section.name}</h4>
              <Badge variant={section.strengthRating >= 70 ? "default" : "destructive"}>
                {section.strengthRating}/100
              </Badge>
            </div>
            <Progress value={section.strengthRating} className="h-2" />
            {section.weaknesses.length > 0 && (
              <div className="space-y-1">
                {section.weaknesses.map((w, i) => (
                  <p key={i} className="text-sm text-score-warning flex items-start gap-1">
                    <span>⚠</span> {w}
                  </p>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground italic">💡 {section.rewriteSuggestion}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
