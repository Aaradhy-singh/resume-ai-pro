export type DemandLevel = "very-high" | "high" | "moderate" | "emerging" | "niche";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type SalaryBand = { min: number; max: number; currency: string };

export interface Occupation {
  id: string;
  title: string;
  industryId: string;
  subcategory: string;
  level: ExperienceLevel;
  description: string;
  coreSkills: string[];
  secondarySkills: string[];
  tools: string[];
  educationPaths: string[];
  portfolioExpectations: string[];
  resumeKeywords: string[];
  demandLevel: DemandLevel;
  salaryBand: SalaryBand;
  careerProgression: string[];
  hybridDomains?: string[];
  isFutureReady?: boolean;
  isHybrid?: boolean;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  roleCount: number;
}

export interface RoleMatch {
  occupation: Occupation;
  matchScore: number;
  matchedSkills: string[];
  missingCoreSkills: string[];
  missingSecondarySkills: string[];
  matchType: "best-fit" | "near-fit" | "future-ready";
  upskillingSuggestions: string[];
}

export interface CareerComparison {
  occupations: Occupation[];
  commonSkills: string[];
  differentiatingSkills: Map<string, string[]>;
}
