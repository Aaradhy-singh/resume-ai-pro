/**
 * Career Stage Card Component
 * Displays detected career stage with confidence and signals
 */

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { GraduationCap, Briefcase, TrendingUp, Award, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CareerStageClassification } from '@/types/career-stage';
import { getStageLabel, getStageDescription } from '@/lib/engines/career-stage-classifier';

interface CareerStageCardProps {
    classification: CareerStageClassification;
}

export function CareerStageCard({ classification }: CareerStageCardProps) {
    const { stage, confidence, signals, reasoning, alternativeStages, confidenceDrivers, uncertaintyFlag, secondaryStage } = classification;

    const getStageIcon = () => {
        switch (stage) {
            case 'student': return GraduationCap;
            case 'fresher': return Briefcase;
            case 'junior': return Briefcase;
            case 'mid-level': return TrendingUp;
            case 'senior': return Award;
        }
    };

    const getStageColor = () => {
        switch (stage) {
            case 'student': return 'bg-blue-500';
            case 'fresher': return 'bg-green-500';
            case 'junior': return 'bg-yellow-500';
            case 'mid-level': return 'bg-orange-500';
            case 'senior': return 'bg-purple-500';
        }
    };

    const StageIcon = getStageIcon();

    return (
        <Card style={{ border: '1px solid #2A2A2A', background: '#0D0D0D', padding: '24px', borderRadius: 0 }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <StageIcon className="w-5 h-5" />
                    Career Stage Classification
                </CardTitle>
                <CardDescription>
                    Detected career level based on resume signals
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Stage Display */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-between"
                    style={{
                        border: '1px solid #1F1F1F',
                        background: '#080808',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        borderRadius: 0
                    }}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 ${getStageColor()}`} style={{ borderRadius: 0 }} />
                            <h3 className="text-2xl font-bold">{getStageLabel(stage)}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {getStageDescription(stage)}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{confidence}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                </motion.div>

                {/* Confidence Warning */}
                {uncertaintyFlag && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                            <strong>Low Confidence Detected:</strong> We're only {confidence}% sure.
                            {secondaryStage && ` It's possible you could be classified as a ${getStageLabel(secondaryStage)}.`}
                            <br />
                            Please ensure your resume includes clear dates and project details.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Confidence Drivers */}
                {confidenceDrivers && confidenceDrivers.length > 0 && (
                    <div className="space-y-3" style={{
                        border: '1px solid #1F1F1F',
                        background: '#080808',
                        padding: '16px 20px'
                    }}>
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Confidence Drivers
                        </h4>
                        <div className="space-y-2">
                            {confidenceDrivers.map((driver, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{driver.signal}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className=""
                                            style={driver.contribution > 0
                                                ? { background: '#051A0A', border: '1px solid #103A1A', color: '#10B981', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }
                                                : { background: '#1A0505', border: '1px solid #3A1010', color: '#EF4444', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}
                                        >
                                            {driver.contribution > 0
                                                ? `+${driver.contribution}%`
                                                : driver.contribution < 0
                                                    ? `${driver.contribution}%`
                                                    : `0%`
                                            }
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Why This Stage? */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="reasoning">
                        <AccordionTrigger className="text-sm font-medium">
                            Why was this stage detected?
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm text-muted-foreground">{reasoning}</p>

                            {/* Key Signals */}
                            <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-semibold">Key Signals Detected:</h4>

                                {signals.totalExperienceYears !== null && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Experience:</span>
                                        <Badge style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>{signals.totalExperienceYears.toFixed(1)} years</Badge>
                                    </div>
                                )}

                                {signals.totalExperienceYears === null && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Experience:</span>
                                        <Badge style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>Not detected</Badge>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span>Employment Entries:</span>
                                    <Badge style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>{signals.employmentCount}</Badge>
                                </div>

                                {signals.internshipCount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Internships:</span>
                                        <Badge style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>{signals.internshipCount}</Badge>
                                    </div>
                                )}

                                {signals.isCurrentStudent && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Student Status:</span>
                                        <Badge style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>Currently Pursuing</Badge>
                                    </div>
                                )}

                                {signals.graduationYear && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Graduation Year:</span>
                                        <Badge style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>{signals.graduationYear}</Badge>
                                    </div>
                                )}

                                {signals.seniorityKeywords.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-sm">Seniority Keywords:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {signals.seniorityKeywords.map((kw, idx) => (
                                                <Badge key={idx} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>
                                                    {kw}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {signals.leadershipIndicators.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-sm">Leadership Indicators:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {signals.leadershipIndicators.map((ind, idx) => (
                                                <Badge key={idx} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9A9A9A', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}>
                                                    {ind}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Alternative Stages */}
                    {alternativeStages.length > 0 && (
                        <AccordionItem value="alternatives">
                            <AccordionTrigger className="text-sm font-medium">
                                Alternative Classifications
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    {alternativeStages.map((alt, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{getStageLabel(alt.stage)}</span>
                                                <span className="text-muted-foreground">{alt.probability}% probability</span>
                                            </div>
                                            <Progress value={alt.probability} className="h-1" />
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>

                {/* Impact Notice */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        This classification affects: JD Alignment score weighting, role matching filters, portfolio evaluation criteria,
                        and recommendation priorities. All analyses are calibrated to your career stage.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
