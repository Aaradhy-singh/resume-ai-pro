# Resume AI Pro - Detailed Project Summary

## 1. Project Overview & Purpose ("Why it is made")

**Resume AI Pro** (or Resume & Portfolio Optimizer) is an advanced web application designed to move beyond traditional, shallow "ATS-checkers" for resumes. Unlike standard tools that rely on simplistic keyword matching, this project relies on **structured, ontology-driven career analytics**. 

**The Core Problem it Solves:**
Job seekers often fail to pass Applicant Tracking Systems (ATS) or impress recruiters because their resumes lack evidence-based skills, suffer from parsing errors due to bad formatting, or don't align perfectly with the target job description (JD). 

**The Solution:**
This application parses resumes and job descriptions locally in the browser, processes them against a canonical "Skill Ontology", normalizes the data, and outputs highly transparent, mathematical gap analyses and actionable recommendations. It also maps out viable adjacent careers based on the user's extracted skills.

---

## 2. Target Audience & Use Cases ("What it is made for")

- **Job Seekers:** To validate their resume formatting, match their skills against specific job descriptions, and receive a strict, step-by-step action plan to improve their ATS score.
- **Career Pivoters:** Through the `Career Explorer` module, users can discover "Adjacent Roles" that require similar skill sets and evaluate the difficulty and time required to transition.
- **Professionals & Students:** To maintain a high-quality portfolio/resume that strictly highlights evidence-based metrics over buzzwords.

---

## 3. Technology Stack ("How it is made")

This project is built as a highly interactive, client-heavy Single Page Application (SPA). It intentionally shifts complex intelligence algorithms to the frontend, ensuring rapid feedback and user data privacy (since everything can be parsed locally).

**Frontend Framework & Tooling:**
- **React 18** and **Vite:** For fast UI rendering, component architecture, and rapid Hot Module Replacement (HMR) during development.
- **TypeScript:** Used extensively for strict typing of complex engine outputs, skill interfaces, and component props.
- **React Router Dom:** For handling multi-page navigation (Landing → Upload → Results/Action Plan/Career Explorer).
- **Tailwind CSS & shadcn-ui:** For a highly polished, accessible, and easily customizable design system.
- **Framer Motion:** For fluid micro-interactions and page transitions, making the analytics feel dynamic and premium.

**Document Parsing & Data Processing:**
- **pdfjs-dist & jspdf / html2canvas:** For parsing uploaded PDF resumes and optionally generating PDF reports.
- **mammoth:** For parsing `.docx` (Word) files accurately.
- **natural:** A general natural language processing (NLP) facility for text tokenization and analysis in the browser.

---

## 4. Architecture & Core Intelligence Engines ("How it works")

The magic of the application lies entirely in `src/lib/engines/`, which behaves like a sophisticated backend running completely on the client-side. The flow of data works as follows:

### Step 1: Upload & Format Check
The user uploads a resume on the **Upload Page (`Upload.tsx`)**. 
The `Format Risk Detector` (`format-risk-detector.ts`) immediately scans the file for parsing hazards (like complex tables or columns) to warn the user if an ATS might fail to read their resume.

### Step 2: Skill Extraction & Normalization
The raw text is fed into the `Skill Normalizer` (`skill-normalizer.ts`). Using a predefined knowledge base (`skill-ontology.ts`), it extracts raw text like "ReactJS", "k8s", or "node" and maps them to their canonical forms: "React", "Kubernetes", "Node.js". 

### Step 3: Job Description (JD) Parsing & Matching
If a JD is provided, the `Job Description Parser` (`jd-parser.ts`) removes boilerplate (e.g., "We are an equal opportunity employer...") and extracts the core required skills. 

### Step 4: Weighted Role Engine & ATS Scoring
- **ATS Scoring (`ats-scoring-engine.ts`)**: Calculates a highly transparent ATS parse score. It doesn't just give a magic number; it gives exact traceability (e.g., "Keyword Match Score = 8/12 matched skills * 100 = 67%").
- **Weighted Role Matcher (`weighted-role-matcher.ts`)**: It evaluates how the user's skills match against known industry roles. It uses a weighted formula (Core skills are worth 3x points, Supporting skills 1.5x, Adjacent 1x) to score the fit.

### Step 5: Insights & Recommendations
The results are split across three primary views:
1. **Results Page (`Results.tsx`)**: Displays the main ATS scores, skill breakdowns, and the "Traceability Accordions" that explain exactly *how* a score was calculated.
2. **Career Explorer (`CareerExplorer.tsx`)**: Powered by `career-adjacency.ts`, it reveals lateral career moves (e.g., matching a Data Analyst to a Business Intelligence Developer) alongside estimated transition times and skill gaps.
3. **Action Plan (`ActionPlan.tsx`)**: Powered by the `Recommendation Engine` (`recommendation-engine.ts`), it aggregates all "deficiencies" (e.g., missing critical keywords, low action verb count) and generates a prioritized, step-by-step checklist of causal recommendations to fix the resume.

---

## 5. Summary

**Resume AI Pro** is a sophisticated, privacy-first, client-side intelligence platform. Rather than leveraging an opaque standard LLM endpoint to guess resume quality, it uses deterministic, math-driven NLP engines, skill ontologies, and weighted heuristics to provide exact, explainable, and accountable career advancement advice. Its UI is clean, deeply explanatory, and heavily focused on evidence-based analysis.
