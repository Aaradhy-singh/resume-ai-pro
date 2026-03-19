import fs from 'fs';
import { analyzeResume } from './src/lib/engines/analysis-orchestrator.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const jdText = `Prompt Engineer — Entry Level
Required Skills:
- Prompt Engineering (required)
- Generative AI tools including ChatGPT, Claude, or Gemini (required)
- Python programming (required)
Preferred:
- LangChain or LlamaIndex
- Data Analytics
- AWS or Google Cloud AI services

Responsibilities:
- Design and optimize prompts for production AI systems
- Build prompt libraries and evaluation frameworks
- Work with LLMs including GPT-4, Claude, Llama
- Document prompt strategies and maintain versioning`;

async function getPdfText(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(' ') + '\n';
    }
    return text;
}

async function runTest() {
    try {
        const resumePath = 'c:/Users/aarad/Downloads/aaradhy_singh_resume.pdf';
        const rawText = await getPdfText(resumePath);

        const parsedResume = { rawText }; // Mocking ParsedResume
        const result = await analyzeResume(parsedResume, jdText);

        const promptEngineerRole = result.roleMatch.bestMatches.find(r => r.role === 'Prompt Engineer');

        console.log("=== Role Match: Prompt Engineer ===");
        if (!promptEngineerRole) {
            console.log("Prompt Engineer role not found in matches!");
            console.log("Matches found:", result.roleMatch.bestMatches.map(r => r.role).join(', '));
            return;
        }

        console.log("Certification Fit:", promptEngineerRole.scores.certificationFit + "%");
        console.log("Project Fit:", promptEngineerRole.scores.projectFit + "%");
        console.log("Portfolio Fit:", promptEngineerRole.scores.portfolioFit + "%");
        console.log("Overall Role Eligibility:", promptEngineerRole.matchScore + "%");

        const awsMatch = promptEngineerRole.details.adjacencySkills.find(s => s.skill === 'AWS' || s.skill === 'Amazon Web Services');
        const gcpMatch = promptEngineerRole.details.adjacencySkills.find(s => s.skill === 'GCP' || s.skill === 'Google Cloud Platform');

        console.log("AWS Adjacency Match:", awsMatch ? awsMatch.matched : 'Not Found');
        console.log("GCP Adjacency Match:", gcpMatch ? gcpMatch.matched : 'Not Found');

    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTest();
