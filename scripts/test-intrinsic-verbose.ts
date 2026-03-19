import fs from 'fs';
import { extractAndNormalizeSkills } from '../src/lib/engines/skill-normalizer';
import { buildIntrinsicDeficiencies } from '../src/lib/engines/recommendation-engine';

const resumeText = fs.readFileSync('C:/tmp/test-resume.txt', 'utf8');

const ACTION_VERB_LIST = [
    'led', 'developed', 'managed', 'created', 'built',
    'designed', 'implemented', 'architected', 'optimized',
    'improved', 'increased', 'reduced', 'achieved',
    'delivered', 'launched', 'drafted', 'translated',
    'conducted', 'proposed', 'analyzed', 'established',
    'coordinated', 'executed', 'spearheaded', 'generated',
    'configured', 'deployed', 'integrated', 'automated',
    'streamlined', 'evaluated', 'identified', 'produced',
    'trained', 'mentored', 'researched', 'collaborated',
    'designed', 'earned', 'completed', 'developed',
    'presented', 'supported', 'maintained', 'reviewed'
];
const resumeLower = resumeText.toLowerCase();
const actionVerbs = ACTION_VERB_LIST.filter(verb => resumeLower.includes(verb));

const rawMetrics = resumeText.match(/\d+%|\$[\d,]+[KMB]?|\d+x\b|\d+\+\s*(users|customers|projects|templates|prompts|certifications|skills|tools|models|workflows|applications|services|endpoints|requests|downloads|clients|AI|cloud)|\d{2,}\+/gi) || [];
const quantifiedMetrics = [...new Set(rawMetrics.map((m: string) => m.toLowerCase()))];

const skillsRes = extractAndNormalizeSkills(resumeText);

const intrinsicInput = {
    resumeText: resumeText,
    quantifiedMetricsCount: quantifiedMetrics.length,
    actionVerbsCount: actionVerbs.length,
    extractedSkills: skillsRes.normalizedSkills.map(s => s.canonical),
    totalWords: resumeText.split(/\s+/).filter(Boolean).length,
};

const deficiencies = buildIntrinsicDeficiencies(intrinsicInput);

console.log("=========================================");
console.log("RecommendationInput:");
console.log(JSON.stringify({ ...intrinsicInput, resumeText: "<omitted for brevity>" }, null, 2));
console.log("resumeText characters:", intrinsicInput.resumeText.length);

console.log("=========================================");
console.log("Checks that fired:");
deficiencies.forEach(d => {
    console.log(`\nID: ${d.id}`);
    console.log(`Trigger Details: ${d.causalContext.deficiencyDetails}`);
    console.log(`Computation Trace: ${d.causalContext.computationTrace}`);
});
console.log("=========================================");

