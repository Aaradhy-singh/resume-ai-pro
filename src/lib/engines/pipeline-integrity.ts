/**
 * Pipeline Integrity Safeguards
 * 
 * Automated post-analysis checks for:
 * 1. Validator bypass detection
 * 2. Missing pipeline stage alerts
 * 3. Confidence degradation warnings
 * 
 * Prevents silent analytical corruption.
 */

export interface IntegrityAlert {
    severity: 'critical' | 'warning' | 'info';
    code: string;
    message: string;
    affectedStage: string;
    suggestedAction: string;
}

export interface IntegrityReport {
    passed: boolean;
    alerts: IntegrityAlert[];
    warnings: IntegrityAlert[];
    checkedStages: string[];
    timestamp: string;
    summary: string;
}

/**
 * Validate the integrity of a completed analysis pipeline.
 * 
 * @param result - The analysis result object from the orchestrator
 */
export function validatePipelineIntegrity(result: Record<string, unknown>): IntegrityReport {
    const alerts: IntegrityAlert[] = [];
    const warnings: IntegrityAlert[] = [];
    const checkedStages: string[] = [];

    // CHECK 1: Evidence validator must have run
    checkedStages.push('evidence-validation');
    if (!result.evidenceVerified && result.evidenceVerified !== undefined) {
        alerts.push({
            severity: 'critical',
            code: 'VALIDATOR_BYPASS',
            message: 'Evidence validation stage returned false. Pipeline results may contain unverified claims.',
            affectedStage: 'evidence-validation',
            suggestedAction: 'Review resume text extraction. Evidence validator may have failed due to malformed input.',
        });
    } else if (result.evidenceVerified === undefined) {
        warnings.push({
            severity: 'warning',
            code: 'VALIDATOR_MISSING',
            message: 'Evidence validation stage was not found in results. Validator may not have been called.',
            affectedStage: 'evidence-validation',
            suggestedAction: 'Ensure analyzeResume() calls the evidence validator before other engines.',
        });
    }

    // CHECK 2: Career stage classification must exist
    checkedStages.push('career-stage');
    const stage = result.careerStage as { confidence: number } | undefined;
    if (!stage) {
        alerts.push({
            severity: 'critical',
            code: 'STAGE_MISSING',
            message: 'Career stage classification is missing. Downstream calibration will be invalid.',
            affectedStage: 'career-stage',
            suggestedAction: 'Check career-stage-classifier.ts for runtime errors.',
        });
    } else if (stage.confidence < 40) {
        warnings.push({
            severity: 'warning',
            code: 'STAGE_LOW_CONFIDENCE',
            message: `Career stage confidence is very low (${stage.confidence}%). Results should be interpreted cautiously.`,
            affectedStage: 'career-stage',
            suggestedAction: 'Check resume text quality. Very short or malformed resumes produce low confidence.',
        });
    }

    // CHECK 3: Keyword Coverage score must be present and within bounds
    checkedStages.push('keyword-coverage');
    const atsResult = result.keywordCoverage as { overall?: number } | undefined | null;
    if (atsResult === undefined || atsResult === null) {
        alerts.push({
            severity: 'critical',
            code: 'KEYWORD_COVERAGE_MISSING',
            message: 'Keyword Coverage score was not computed. Resume scoring is incomplete.',
            affectedStage: 'keyword-coverage',
            suggestedAction: 'Check ats-scoring-engine.ts for runtime errors.',
        });
    } else if (typeof atsResult === 'object' && atsResult?.overall !== undefined) {
        if (atsResult.overall < 0 || atsResult.overall > 100) {
            alerts.push({
                severity: 'critical',
                code: 'KEYWORD_COVERAGE_OUT_OF_BOUNDS',
                message: `Keyword Coverage score is out of bounds: ${atsResult.overall}. Must be 0-100.`,
                affectedStage: 'keyword-coverage',
                suggestedAction: 'Review score computation logic for overflow or negative values.',
            });
        }
    }

    // CHECK 4: Role matches should exist if skills were extracted
    checkedStages.push('role-matching');
    const normSkills = result.normalizedSkills as unknown[] | undefined;
    if (normSkills && normSkills.length > 0 && !result.roleMatches) {
        warnings.push({
            severity: 'warning',
            code: 'ROLE_MATCH_MISSING',
            message: 'Skills were extracted but role matching was not performed.',
            affectedStage: 'role-matching',
            suggestedAction: 'Ensure weighted-role-matcher.ts is called after skill normalization.',
        });
    }

    // CHECK 5: Evidence Strength Index check
    checkedStages.push('evidence-strength');
    const evidenceStrength = result.evidenceStrength as { overallScore: number } | undefined;
    if (evidenceStrength) {
        if (evidenceStrength.overallScore < 30) {
            warnings.push({
                severity: 'warning',
                code: 'EVIDENCE_WEAK',
                message: `Evidence strength is very low (${evidenceStrength.overallScore}/100). All scores should be treated as low-confidence estimates.`,
                affectedStage: 'evidence-strength',
                suggestedAction: 'Flag to user that resume lacks verifiable metrics, dates, or documented projects.',
            });
        }
    }

    // CHECK 6: Market calibration should follow JD Alignment scoring
    checkedStages.push('market-calibration');
    if (result.keywordCoverage && !result.calibration) {
        warnings.push({
            severity: 'info',
            code: 'CALIBRATION_MISSING',
            message: 'Keyword Coverage score computed but market calibration was not applied.',
            affectedStage: 'market-calibration',
            suggestedAction: 'Wire calibrateJDAlignmentScore() after scoring in the orchestrator.',
        });
    }

    // CHECK 7: Project complexity should be computed
    checkedStages.push('project-complexity');
    if (!result.projectComplexity) {
        warnings.push({
            severity: 'info',
            code: 'COMPLEXITY_MISSING',
            message: 'Project complexity analysis was not performed.',
            affectedStage: 'project-complexity',
            suggestedAction: 'Wire analyzeProjectComplexity() in the orchestrator pipeline.',
        });
    }

    // CHECK 8: Recommendations should have impact projections
    checkedStages.push('recommendation-impact');
    const recs = result.recommendations as unknown[] | undefined;
    if (recs && recs.length > 0) {
        const hasImpact = recs.some(
            (r: unknown) => {
                const rec = r as { projectedImpact?: { atsGain?: number } };
                return rec.projectedImpact && rec.projectedImpact.atsGain !== undefined;
            }
        );
        if (!hasImpact) {
            warnings.push({
                severity: 'info',
                code: 'IMPACT_MISSING',
                message: 'Recommendations exist but lack impact projections.',
                affectedStage: 'recommendation-impact',
                suggestedAction: 'Call attachImpactSimulations() after generating recommendations.',
            });
        }
    }

    // Compile report
    const passed = alerts.length === 0;
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = warnings.length;

    let summary = `Pipeline integrity: ${passed ? 'PASSED' : 'FAILED'}.`;
    summary += ` Checked ${checkedStages.length} stages.`;
    if (criticalCount > 0) summary += ` ${criticalCount} critical alert(s).`;
    if (warningCount > 0) summary += ` ${warningCount} warning(s).`;

    return {
        passed,
        alerts,
        warnings,
        checkedStages,
        timestamp: new Date().toISOString(),
        summary,
    };
}
