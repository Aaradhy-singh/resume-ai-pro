const fs = require('fs');
const path = require('path');

const files = [
    "src/components/results/JDAlignmentScoreCard.tsx",
    "src/components/results/JobMatchCard.tsx",
    "src/components/results/KeywordGapTable.tsx",
    "src/components/results/ResultsHeader.tsx",
    "src/components/results/ResultsStateViews.tsx",
    "src/components/results/SpecificityScoreCard.tsx",
    "src/components/analysis/RoleEligibilityPanel.tsx",
    "src/components/analysis/ScoreContributionHeatmap.tsx",
    "src/components/analysis/SkillMatchOverlay.tsx",
    "src/components/analysis/CareerStageCard.tsx",
    "src/components/analysis/EvidenceSourceBadge.tsx"
];

let report = `# Full File Contents\n\n`;

for (const file of files) {
    report += `\n## ${file}\n\`\`\`tsx\n`;
    report += fs.readFileSync(file, 'utf-8');
    report += `\n\`\`\`\n`;
}

report += `

## Question 3 Answers

### JDAlignmentScoreCard.tsx
- **Props**: \`score: TransparentJDAlignmentScore | null;\`
- **Fields read**: \`score.overall\`, \`score.stageAdjusted\`, \`score.careerStage\`, \`score.factors\` (and nested fields \`score\`, \`computation\`, \`weight\`), \`score.disclaimer\`.
- **Calculations**: \`useCountUp(score?.overall || 0, 1400)\` for animation. SVG stroke mapping \`(animatedScore / 100) * 352\`. Factor objects are mapped, dynamically filtering out nulls.
- **Hardcoded/Magic**: Status colors (e.g., \`text-green-500\`). Icon/Label mappings. Baseline \`1400\` animation speed. \`svg r="56"\`, circumference \`352\`. Fallback text \`'General'\`.
- **Conditional hides**: Fails safely via \`if (!score) return null;\`. \`.filter(Boolean)\` silently hides non-applicable scoring factors.

### JobMatchCard.tsx
- **Props**: \`match: WeightedRoleMatch; fitLevel?: 'perfect' | 'reach' | 'stretch' | 'mismatch'; roleSeniority?: RoleSeniority;\`
- **Fields read**: \`match.occupation.title\`, \`match.weightedScore\`, \`match.coreSkillMatch\`, \`match.missingSkills.core\`, \`match.supportingSkillMatch\`, \`match.adjacencySkillMatch\`.
- **Calculations**: Slices missing arrays (\`.slice(0, 3)\`, \`.slice(0, 5)\`). Computes remaining hidden tag counts (\`.length - 5\`).
- **Hardcoded/Magic**: Label mappings (\`"Perfect Fit"\`, \`"Reach Role"\`, etc.). Render thresholds (e.g. slicing exactly 0,3 or 0,5). String interpolations: \`All core skills matched!\`.
- **Conditional hides**: \`getFitBadge\` / \`getSeniorityBadge\` silently return null if their prop values are undefined. 'Critical Gaps' section silently vanishes if \`missingSkills.core.length === 0\`.

### KeywordGapTable.tsx
- **Props**: \`data: GapAnalysisResult;\`
- **Fields read**: \`data.safeToDisplay\`, \`data.totalGaps\`, \`data.matchScore\`, \`data.genuineGaps\`, \`data.mentionGaps\`, \`data.criticalGaps\`, \`data.importantGaps\`. Keyword array elements (\`keyword\`, \`frequency\`, \`context\`).
- **Calculations**: Arrays \`criticalGaps\` and \`importantGaps\` are combined via spread mapping into \`allGaps\` to assign a presentation \`priority\` string.
- **Hardcoded/Magic**: Inline styling hex colors. Strings like \`"SKILL GAPS — GO LEARN THESE"\`, \`"MENTION GAPS — JUST ADD TO RESUME"\`. Fallback: \`gap.context[0] || "No context found"\`.
- **Conditional hides**: Instantly hidden via \`if (!data.safeToDisplay || data.totalGaps === 0) return null;\`. Genuine and Mention gap sections internally skip rendering if array length is 0.

### ResultsHeader.tsx
- **Props**: \`data: AnalysisResult;\`
- **Fields read**: \`data.meta.timestamp\`.
- **Calculations**: Date generation: \`new Date(data.meta.timestamp).toLocaleDateString()\`.
- **Hardcoded/Magic**: A massive amount of component-local inline styles. Display strings: \`"Analysis Results"\`, \`"Generated"\`, \`"New Analysis"\`, \`"→ VIEW ACTION PLAN"\`, \`"Export Report"\`. \`EvidenceSourceBadge\` uses hardcoded source prop \`"resume-extracted"\`.
- **Conditional hides**: No empty validation. Render trusts the timestamp structure absolutely.

### ResultsStateViews.tsx
- **Props**: None.
- **Fields read**: None.
- **Calculations**: None.
- **Hardcoded/Magic**: Status messages: \`"Loading analysis details..."\`, \`"No Analysis Data Found"\`.
- **Conditional hides**: None.

### SpecificityScoreCard.tsx
- **Props**: \`report: SpecificityReport;\`
- **Fields read**: \`report.bullets.length\`, \`report.overallGrade\`, \`report.averageScore\`, \`report.distribution\`, \`report.weakBullets\`, \`report.strongBullets\`.
- **Calculations**: \`pct = total > 0 ? (count / total) * 100 : 0;\` determines flex widths. Array slicing (\`weakBullets.slice(0, 4)\` and \`strongBullets.slice(0, 2)\`).
- **Hardcoded/Magic**: Component-level mapping dictionaries (\`gradeColors\`, \`scoreColors\`, \`scoreLabels\`). Section titles: \`"SCORE DISTRIBUTION"\`, \`"NEEDS REWRITING"\`.
- **Conditional hides**: \`if (!report || report.bullets.length === 0) return null;\` abandons render silently. Missing score distributions fall back properly using ternary logic.

### RoleEligibilityPanel.tsx
- **Props**: \`roleTitle\`, \`skillFit\`, \`experienceFit\`, \`projectFit\`, \`portfolioFit\`, \`certificationFit\`, \`overallMultiFactor\`, \`matchType\`, \`multiFactorBreakdown\`, \`careerStage\`, \`className\`.
- **Fields read**: All props read except \`multiFactorBreakdown\` (passed but unused by the visual UI).
- **Calculations**: \`Math.max(3, score)\` restricts minimum axis visual bar width. Format transforms: \`careerStage.charAt(0).toUpperCase() + careerStage.slice(1).replace('-', ' ')\`.
- **Hardcoded/Magic**: Fixed label maps in \`FitAxis\`. Badge maps. \`"Weights are dynamically adjusted for..."\` and stage-targeted descriptions strings.
- **Conditional hides**: Stage note suffix evaluates \`careerStage === 'student'\`, \`'senior'\`, or \`'junior' || 'mid-level'\`. An undocumented or mis-cased stage silently receives no context line.

### ScoreContributionHeatmap.tsx
- **Props**: \`factors: ScoringFactor[]\`, \`overallScore\`, \`className\`.
- **Fields read**: \`factor.name\`, \`factor.score\`, \`factor.weight\`, \`overallScore\`.
- **Calculations**: Itero-sorts array: \`(b.weight * b.score) - (a.weight * a.score)\`. Calculates rounded PTS: \`Math.round((factor.weight * factor.score) / 100)\`. Visually constrains bar \`Math.max(4, Math.min(100, score))\`.
- **Hardcoded/Magic**: \`getHeatStyle\` config blocks. Label: \`"Score Contribution Heatmap"\`. Subtext: \`"Factors sorted by contribution..."\`.
- **Conditional hides**: Maps array blindly without explicit \`factors.length\` check logic mapping (safe but uncontrolled).

### SkillMatchOverlay.tsx
- **Props**: \`matchedSkills\`, \`missingSkills\`, \`roleTitle\`, \`className\`.
- **Fields read**: Arrays for \`core\`, \`supporting\`, \`adjacency\` counts/elements. \`roleTitle\`.
- **Calculations**: Sums subsets to calculate \`totalMatched\` & \`totalMissing\`. Determines percentage: \`total > 0 ? Math.round((totalMatched / total) * 100) : 0\`. Calculates subset rate: \`(matched.length / total) * 100\`.
- **Hardcoded/Magic**: \`styleMap\` and \`iconMap\`. Section string names (\`"Core Skills (3× weight)"\`, etc).
- **Conditional hides**: \`"partial"\` state logic exists in \`styleMap\` but is never passed or assigned throughout the file. No explicit null handling—undefined sub-arrays will crash the component map immediately.

### CareerStageCard.tsx
- **Props**: \`classification: CareerStageClassification;\`
- **Fields read**: \`stage\`, \`confidence\`, \`signals\`, \`reasoning\`, \`alternativeStages\`, \`confidenceDrivers\`, \`uncertaintyFlag\`, \`secondaryStage\`. Deep keys: \`totalExperienceYears\`, \`employmentCount\`, \`internshipCount\`, etc.
- **Calculations**: Formatter transforms (\`toFixed(1)\`).
- **Hardcoded/Magic**: Mappers for \`getStageIcon\` and \`getStageColor\`. Informational alert descriptors (\`"Low Confidence Detected: "\` and \`"Why was this stage detected?"\`).
- **Conditional hides**: The \`uncertaintyFlag\` Alert is completely hidden if flag is absent. \`confidenceDrivers\` is hidden if empty. Most signal badges execute conditional renders (\`internshipCount > 0\`, \`isCurrentStudent\`, etc.) silencing fields that shouldn't appear physically.

### EvidenceSourceBadge.tsx
- **Props**: \`source: EvidenceSource\`, \`detail?: string\`, \`showIcon?: boolean\`.
- **Fields read**: \`source\`, \`detail\`, \`showIcon\`.
- **Calculations**: Config dict parameter lookup.
- **Hardcoded/Magic**: Exact literal maps inside \`config\` dictionary for icons, variant strings, description strings (\`"⚠️ Inferred by AI"\`), and hardcoded confidence texts.
- **Conditional hides**: Legend component explicitly maps over four sources only (\`resume-extracted\`, \`portfolio-computed\`, \`jd-derived\`, \`ai-inferred\`), silently hiding \`user-provided\` from the global map list.


## Question 4: src/pages/Results.tsx Return Block

\`\`\`tsx
`;

const resultsContent = fs.readFileSync('src/pages/Results.tsx', 'utf-8');
const returnBlock = resultsContent.substring(resultsContent.indexOf('return ('), resultsContent.lastIndexOf(');') + 2);
report += returnBlock + '\n```\n\n';

report += `
## Question 5: Searches

Upon exact inspection of all \`src/components/results\`, \`src/components/analysis\`, and \`src/pages/Results.tsx\`:

- **Any console.log statements left in**: 
  - Zero \`console.log\` statements are active.
  - Exactly one \`console.error\` statement exists in \`src/pages/Results.tsx\` mapping standard try/catch errors to browser dev tools.
- **Any "TODO" or "FIXME" comments**: 
  - Zero detected.
- **Any hardcoded strings like "Coming soon", "Not available", or "N/A"**: 
  - **"N/A"** is hardcoded in exactly two places within the \`Results.tsx\` report export blob string array:
    - \`Overall Score: \${data.scores.keywordCoverage?.overall ?? 'N/A'}\`
    - \`Top Role Match: \${data.roles.topMatch?.occupation.title ?? 'N/A'}\\n\`
- **Any Math.random() calls**: 
  - Zero detected.
- **Any values divided by zero risk (division without checking denominator > 0)**:
  - **None exist.** All divisions are either explicitly blocked against 0 or are utilizing inherently safe static denominators.
    - \`JDAlignmentScoreCard.tsx\`: Divides by static \`100\` — SAFE.
    - \`ScoreContributionHeatmap.tsx\`: Divides by static \`100\` — SAFE.
    - \`SpecificityScoreCard.tsx\`: Guard wall exists: \`pct = total > 0 ? (count / total) * 100 : 0;\` — SAFE.
    - \`SkillMatchOverlay.tsx\`: Guard wall exists: \`matchRate = total > 0 ? Math.round((matched.length / total) * 100) : 0;\` and \`overallMatch = total > 0 ? ... : 0;\` — SAFE.
`;

fs.writeFileSync('report.md', report, 'utf-8');
