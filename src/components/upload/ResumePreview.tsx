import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, User, Briefcase, Code, GraduationCap, Award, FolderOpen, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { ParsedSection } from "@/lib/types";
import { parseResumeSections } from "@/lib/parsers/section-parser";

const iconMap: Record<string, React.ElementType> = {
  "Professional Summary": User,
  Skills: Code,
  "Work Experience": Briefcase,
  Education: GraduationCap,
  Projects: FolderOpen,
  Certifications: Award,
};



const confidenceColor = (c: number) => {
  if (c >= 80) return "text-score-excellent";
  if (c >= 60) return "text-score-good";
  if (c >= 40) return "text-score-warning";
  return "text-score-poor";
};

const methodLabel = (m: ParsedSection["detectionMethod"]) => {
  switch (m) {
    case "heading": return "Heading Match";
    case "semantic": return "Semantic Inference";
    case "keyword-heuristic": return "Keyword Heuristic";
    default: return "Not Detected";
  }
};

export function ResumePreview({ resumeText }: { resumeText: string }) {
  const sections = parseResumeSections(resumeText);
  const foundCount = sections.filter((s) => s.found).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Parsed Resume Preview
            <Badge variant="secondary" className="ml-auto">
              {foundCount}/{sections.length} sections detected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section) => {
              const Icon = iconMap[section.name] || FileText;
              return (
                <div
                  key={section.name}
                  className={`p-3 rounded-lg border transition-colors ${section.found
                      ? "bg-accent-subtle border-accent-subtle"
                      : "bg-muted border-border opacity-60"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${section.found ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{section.name}</span>
                    {section.found ? (
                      <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">
                        Found
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
                        Missing
                      </Badge>
                    )}
                  </div>
                  {section.found && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${confidenceColor(section.confidence)}`}>
                          {section.confidence}% confidence
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">
                              Detection: <strong>{methodLabel(section.detectionMethod)}</strong>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {section.content.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {section.content[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
