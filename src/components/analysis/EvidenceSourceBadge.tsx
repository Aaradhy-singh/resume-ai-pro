/**
 * Evidence Source Badge Component
 * Visual indicators showing data provenance
 */

import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText, Briefcase, Github, Sparkles } from 'lucide-react';

export type EvidenceSource =
    | 'resume-extracted'
    | 'jd-derived'
    | 'portfolio-computed'
    | 'ai-inferred'
    | 'user-provided';

interface EvidenceSourceBadgeProps {
    source: EvidenceSource;
    detail?: string; // Additional context
    showIcon?: boolean;
}

export function EvidenceSourceBadge({
    source,
    detail,
    showIcon = true,
}: EvidenceSourceBadgeProps) {
    const config = {
        'resume-extracted': {
            label: 'Resume',
            icon: FileText,
            variant: 'default' as const,
            color: 'bg-green-500',
            description: 'Directly extracted from your resume',
            confidence: 'High Confidence',
        },
        'portfolio-computed': {
            label: 'GitHub',
            icon: Github,
            variant: 'secondary' as const,
            color: 'bg-blue-500',
            description: 'Computed from your GitHub portfolio',
            confidence: 'High Confidence',
        },
        'jd-derived': {
            label: 'Job Desc',
            icon: Briefcase,
            variant: 'outline' as const,
            color: 'bg-purple-500',
            description: 'Derived from the job description',
            confidence: 'Medium Confidence',
        },
        'ai-inferred': {
            label: 'AI Inferred',
            icon: Sparkles,
            variant: 'destructive' as const,
            color: 'bg-orange-500',
            description: '⚠️ Inferred by AI - May not be accurate',
            confidence: 'Low Confidence',
        },
        'user-provided': {
            label: 'User Input',
            icon: FileText,
            variant: 'secondary' as const,
            color: 'bg-gray-500',
            description: 'Provided by you in the form',
            confidence: 'High Confidence',
        },
    };

    const { label, icon: Icon, variant, description, confidence } = config[source];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={variant} className="text-xs gap-1">
                        {showIcon && <Icon className="w-3 h-3" />}
                        {label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-semibold text-sm">{description}</p>
                        <p className="text-xs text-muted-foreground">
                            <strong>{confidence}</strong>
                            {detail && ` • ${detail}`}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * Evidence Source Legend
 * Shows what each badge means
 */
export function EvidenceSourceLegend() {
    const sources: EvidenceSource[] = [
        'resume-extracted',
        'portfolio-computed',
        'jd-derived',
        'ai-inferred',
    ];

    return (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            <span className="text-xs font-semibold text-muted-foreground mr-2">
                Data Sources:
            </span>
            {sources.map((source) => (
                <EvidenceSourceBadge key={source} source={source} showIcon={true} />
            ))}
        </div>
    );
}
