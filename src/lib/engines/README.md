# Intelligence Engines — Integration Guide

## Overview

This directory contains the upgraded intelligence engines for the Resume & Portfolio Optimizer. These engines replace shallow heuristic analysis with structured, ontology-driven career analytics.

## Core Engines

### 1. Skill Ontology (`skill-ontology.ts`)
**Purpose:** Canonical skill database with 100+ skills across 12 categories.

**Usage:**
```typescript
import { skillOntology, buildVariantMap, getSkillCategory } from "@/lib/engines/skill-ontology";

// Get variant mappings
const variantMap = buildVariantMap();
const canonical = variantMap.get("k8s"); // Returns "Kubernetes"

// Get category
const category = getSkillCategory("React"); // Returns "framework"
```

---

### 2. Skill Normalizer (`skill-normalizer.ts`)
**Purpose:** Extract and normalize skills from resume text.

**Usage:**
```typescript
import { extractAndNormalizeSkills } from "@/lib/engines/skill-normalizer";

const result = extractAndNormalizeSkills(resumeText);
// Returns: { rawSkills, normalizedSkills, unrecognizedTerms }

// Display both raw and normalized
console.log("Raw:", result.rawSkills); // ["React", "ReactJS", "K8s"]
console.log("Normalized:", result.normalizedSkills); // [{ canonical: "React", ... }, { canonical: "Kubernetes", ... }]
```

---

### 3. Weighted Role Matcher (`weighted-role-matcher.ts`)
**Purpose:** Match skills to roles using weighted importance (core 3×, supporting 1.5×, adjacency 1×).

**Usage:**
```typescript
import { matchToAllWeightedRoles, explainWeightedScore } from "@/lib/engines/weighted-role-matcher";

const userSkills = extractAndNormalizeSkills(resumeText).normalizedSkills;
const matches = matchToAllWeightedRoles(userSkills, 10); // Top 10 matches

// Get detailed explanation
const explanation = explainWeightedScore(matches[0]);
console.log(explanation); // Shows point-by-point calculation
```

---

### 4. Career Adjacency (`career-adjacency.ts`)
**Purpose:** Find adjacent roles and calculate transition difficulty.

**Usage:**
```typescript
import { getAdjacentRoles, calculateSkillGap } from "@/lib/engines/career-adjacency";
import { weightedOccupations } from "@/lib/engines/occupation-data-weighted";

const currentRole = weightedOccupations[0]; // Machine Learning Engineer
const adjacent = getAdjacentRoles(currentRole);

// Show transition path
adjacent.forEach((adj) => {
  console.log(`${adj.occupation.title}: ${adj.adjacencyScore}% similar`);
  console.log(`Difficulty: ${adj.transitionDifficulty} (${adj.estimatedTransitionTime})`);
});
```

---

### 5. Transparent ATS Scoring (`ats-scoring-engine.ts`)
**Purpose:** Explainable ATS scoring with full traceability.

**Usage:**
```typescript
import { computeTransparentATSScore } from "@/lib/engines/ats-scoring-engine";

const input = {
  resumeText,
  jobDescriptionText,
  extractedSkills,
  jdSkills,
  sections: [...],
  // ...
};

const atsScore = computeTransparentATSScore(input);

console.log(atsScore.overall); // 72
console.log(atsScore.disclaimer); // "⚠️ This is a heuristic simulation..."
console.log(atsScore.factors.keywordMatch.computation); // "(8/12) × 100 = 67%"
```

---

### 6. Job Description Parser (`jd-parser.ts`)
**Purpose:** Clean job descriptions by removing noise.

**Usage:**
```typescript
import { cleanJobDescription } from "@/lib/engines/jd-parser";

const cleaned = cleanJobDescription(jobDescriptionText);

console.log("Noise removed:", cleaned.noiseReduction + "%");
console.log("Extracted keywords:", cleaned.extractedSkillKeywords);
console.log("Removed boilerplate:", cleaned.removedBoilerplate);
```

---

### 7. Format Risk Detector (`format-risk-detector.ts`)
**Purpose:** Assess resume formatting for ATS parsing reliability.

**Usage:**
```typescript
import { computeParsingReliability } from "@/lib/engines/format-risk-detector";

const assessment = computeParsingReliability(resumeText);

console.log("Reliability score:", assessment.parsingReliabilityScore); // 0-100
console.log("Has tables:", assessment.hasTables);
assessment.risks.forEach((risk) => {
  console.log(`[${risk.severity}] ${risk.issue}: ${risk.suggestion}`);
});
```

---

### 8. Recommendation Engine (`recommendation-engine.ts`)
**Purpose:** Generate causal recommendations from deficiencies.

**Usage:**
```typescript
import { generateRecommendations, type AnalysisDeficiency } from "@/lib/engines/recommendation-engine";

const deficiencies: AnalysisDeficiency[] = [
  {
    type: "keyword-gap",
    severity: 80,
    details: { keyword: "GraphQL", importance: "high", jdFrequency: 5, suggestedSection: "Skills" },
  },
];

const recommendations = generateRecommendations(deficiencies);

recommendations.forEach((rec) => {
  console.log(rec.title);
  console.log("Impact:", rec.estimatedImpact); // 1-10
  console.log("Why:", rec.causalContext.triggerDataSource);
  console.log("Trace:", rec.causalContext.computationTrace);
});
```

---

## UI Components

### TraceabilityAccordion (`TraceabilityAccordion.tsx`)
**Purpose:** Display "How was this calculated?" for any score.

**Usage:**
```tsx
import { TraceabilityAccordion } from "@/components/results/TraceabilityAccordion";

<TraceabilityAccordion
  title="Keyword Match Score"
  score={keywordScore}
  inputData={{
    resumeSkills: 8,
    jdSkills: 12,
    matchedSkills: ["Python", "React", "Docker"],
  }}
  weights={{ "Keyword Match": 30 }}
  computation="(8 matched skills / 12 JD skills) × 100 = 67%"
  result={67}
/>
```

---

## Integration Checklist

### Step 1: Update Results Page
- [ ] Import `extractAndNormalizeSkills` and `matchToAllWeightedRoles`
- [ ] Replace old skill extraction with normalized extraction
- [ ] Replace old role matching with weighted matching
- [ ] Add `TraceabilityAccordion` to score displays

### Step 2: Update ATS Scoring
- [ ] Import `computeTransparentATSScore`
- [ ] Replace old ATS logic with transparent engine
- [ ] Add disclaimer display
- [ ] Add traceability for each ATS factor

### Step 3: Update Career Explorer
- [ ] Import `getAdjacentRoles` and `calculateSkillGap`
- [ ] Display adjacent roles with transition info
- [ ] Show career pathways
- [ ] Display skill gap breakdowns

### Step 4: Update Action Plan
- [ ] Import `generateRecommendations`
- [ ] Map analysis results to deficiencies
- [ ] Generate causal recommendations
- [ ] Display trigger data source for each

### Step 5: Add Format Risk Warning
- [ ] Import `computeParsingReliability`
- [ ] Check uploaded resume on upload page
- [ ] Display warning if score < 75
- [ ] Show specific risks and suggestions

---

## Example: Complete Analysis Flow

```typescript
// 1. Extract and normalize skills
const resumeAnalysis = extractAndNormalizeSkills(resumeText);
const jdAnalysis = extractAndNormalizeSkills(jobDescriptionText);

// 2. Clean job description
const cleanedJD = cleanJobDescription(jobDescriptionText);

// 3. Match to roles
const roleMatches = matchToAllWeightedRoles(resumeAnalysis.normalizedSkills, 10);

// 4. Get adjacency recommendations
const topMatch = weightedOccupations.find((occ) => occ.id === roleMatches[0].occupation.id);
if (topMatch) {
  const adjacent = getAdjacentRoles(topMatch);
}

// 5. Compute ATS score
const atsInput = {
  resumeText,
  jobDescriptionText: cleanedJD.cleanedText,
  extractedSkills: resumeAnalysis.normalizedSkills.map((s) => s.canonical),
  jdSkills: jdAnalysis.normalizedSkills.map((s) => s.canonical),
  sections: [...],
  actionVerbsCount: 0,
  quantifiedMetricsCount: 0,
  totalWords: resumeText.split(/\s+/).length,
};
const atsScore = computeTransparentATSScore(atsInput);

// 6. Check format risks
const formatAssessment = computeParsingReliability(resumeText);

// 7. Generate recommendations
const deficiencies: AnalysisDeficiency[] = [
  // Map from analysis results...
];
const recommendations = generateRecommendations(deficiencies);
```

---

## Type Exports

All engines export their type definitions. Import as needed:

```typescript
import type { NormalizedSkill, SkillExtractionResult } from "@/lib/engines/skill-normalizer";
import type { WeightedRoleMatch } from "@/lib/engines/weighted-role-matcher";
import type { AdjacentRoleMatch, SkillGapAnalysis } from "@/lib/engines/career-adjacency";
import type { TransparentATSScore, ScoringDetail } from "@/lib/engines/ats-scoring-engine";
import type { CausalRecommendation } from "@/lib/engines/recommendation-engine";
```

---

## Testing

Each engine can be tested independently:

```bash
# Example unit test structure
import { extractAndNormalizeSkills } from "@/lib/engines/skill-normalizer";

test("normalizes React variants", () => {
  const text = "React ReactJS react.js";
  const result = extractAndNormalizeSkills(text);
  
  expect(result.normalizedSkills).toHaveLength(1);
  expect(result.normalizedSkills[0].canonical).toBe("React");
  expect(result.normalizedSkills[0].rawVariants).toContain("React");
});
```

---

## Performance Notes

- **Skill Extraction:** O(n) where n = text length
- **Normalization:** O(m) where m = number of raw skills
- **Role Matching:** O(r × s) where r = roles, s = skills
- **Adjacency:** O(r²) for all pairwise comparisons

For large-scale analysis (100+ resumes), consider:
- Caching `buildVariantMap()` result
- Batching role matches
- Memoizing adjacency calculations

---

## Support

For questions or issues with the intelligence engines, refer to:
- [`implementation_plan.md`](file:///C:/Users/aarad/.gemini/antigravity/brain/c7caab89-c30d-47de-b6dc-91d012a41565/implementation_plan.md) — Original design specifications
- [`walkthrough.md`](file:///C:/Users/aarad/.gemini/antigravity/brain/c7caab89-c30d-47de-b6dc-91d012a41565/walkthrough.md) — Implementation details
