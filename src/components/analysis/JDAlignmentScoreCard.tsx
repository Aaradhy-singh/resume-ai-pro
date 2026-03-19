/**
 * JD Alignment Score Card Component
 * Displays animated JD Alignment Score with breakdown and traceability
 */

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TraceabilityAccordion } from '@/components/results/TraceabilityAccordion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TransparentJDAlignmentScore } from '@/lib/engines/ats-scoring-engine';

interface JDAlignmentScoreCardProps {
    atsScore: TransparentJDAlignmentScore;
}

export function JDAlignmentScoreCard({ atsScore }: JDAlignmentScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>JD Keyword Coverage Score</CardTitle>
                <CardDescription>
                    Estimated keyword coverage against the job description
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="relative"
                    >
                        <div className={`text-7xl font-bold ${getScoreColor(atsScore.overallScore)}`}>
                            {atsScore.overallScore}
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-1">
                            out of 100
                        </div>
                    </motion.div>
                </div>

                {/* Disclaimer */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {atsScore.disclaimer}
                    </AlertDescription>
                </Alert>

                {/* Factor Breakdown */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Score Breakdown</h4>

                    {Object.entries(atsScore.factors).map(([key, detail]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className={`font-semibold ${getScoreColor(detail.score)}`}>
                                    {detail.score}/100
                                </span>
                            </div>
                            <Progress
                                value={detail.score}
                                className="h-2"
                            />
                            <TraceabilityAccordion
                                title={`How was ${key} calculated?`}
                                score={detail.score}
                                inputData={{}}
                                weights={{ [key]: detail.weight }}
                                computation={detail.computation}
                                result={detail.score}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
