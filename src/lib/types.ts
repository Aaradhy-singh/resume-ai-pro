export interface JDAlignmentScore {
  overall: number;
  formatting: number;
  keywordDensity: number;
  sectionCompleteness: number;
  skillsRelevance: number;
  experienceAlignment: number;
  details: string[];
  weightBreakdown: JDAlignmentWeightBreakdown[];
}

export interface JDAlignmentWeightBreakdown {
  factor: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
}

export interface SkillMatch {
  skill: string;
  inResume: boolean;
  inJobDescription: boolean;
  importance: "high" | "medium" | "low";
  type: "hard" | "soft";
}

export interface JobMatchAnalysis {
  matchPercentage: number;
  skillOverlap: SkillMatch[];
  missingSkills: string[];
  experienceGap: string;
}

export interface KeywordGap {
  keyword: string;
  importance: "high" | "medium" | "low";
  suggestedPlacement: string;
  foundInJD: boolean;
  jdFrequency: number;
  resumeOccurrences: number;
  required: boolean;
}

export interface SectionAnalysis {
  name: string;
  strengthRating: number;
  weaknesses: string[];
  rewriteSuggestion: string;
}

export interface RewriteSuggestion {
  section: string;
  original: string;
  optimized: string;
}

export interface PortfolioAnalysis {
  projectDiversity: number;
  techStackDepth: number;
  deploymentPresence: number;
  documentationQuality: number;
  githubActivity: number;
  overallRating: number;
  suggestions: string[];
  scoringInputs: PortfolioScoringInput[];
}

export interface PortfolioScoringInput {
  metric: string;
  rawValue: string;
  weight: number;
  score: number;
  maxScore: number;
}

export interface ActionItem {
  id: string;
  category: "priority" | "skills" | "certifications" | "portfolio";
  title: string;
  description: string;
  completed: boolean;
  priorityLevel: "critical" | "high" | "medium" | "low";
  estimatedEffort: string;
  recruiterImpact: number;
  triggerReason: string;
}

export interface ParsedSection {
  name: string;
  content: string[];
  found: boolean;
  confidence: number;
  detectionMethod: "heading" | "semantic" | "keyword-heuristic" | "not-detected";
}

export interface AnalysisResult {
  keywordCoverage: JDAlignmentScore;
  jobMatch: JobMatchAnalysis;
  keywordGaps: KeywordGap[];
  sectionAnalyses: SectionAnalysis[];
  rewriteSuggestions: RewriteSuggestion[];
  portfolioAnalysis: PortfolioAnalysis;
}

export interface NormalizedSkill {
  originalTerm: string;
  canonicalName: string;
  category: "language" | "framework" | "tool" | "cloud" | "soft" | "concept" | "database" | "other";
  confidence: number;
}

export interface ParsedResume {
  rawText: string;
  sections: ParsedSection[];
  skills: NormalizedSkill[];
  experienceYears: number;
  contactInfo: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGithub: boolean;
  };
}

export interface ParsedJobDescription {
  rawText: string;
  requiredSkills: NormalizedSkill[];
  preferredSkills: NormalizedSkill[];
  jobTitle: string | null;
  experienceLevel: "entry" | "mid" | "senior" | "executive" | "unknown";
}

export interface CareerTransitionProbability {
  targetRole: string;
  probabilityScore: number;
  timeToTransitionMonths: number;
  missingCoreSkills: string[];
  transferableSkills: string[];
}
