/**
 * Traceability Accordion Component
 * 
 * Reusable UI component for displaying "How was this calculated?" 
 * explanations with inputs, weights, and computation formulas.
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface TraceabilityAccordionProps {
    title: string;
    score: number;
    inputData: Record<string, unknown>;
    weights?: Record<string, number>;
    computation: string;
    result: number;
}

export function TraceabilityAccordion({
    title,
    score,
    inputData,
    weights,
    computation,
    result,
}: TraceabilityAccordionProps) {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="traceability" className="border-none">
                <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>How was this calculated?</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 pt-2">
                        {/* Input Data */}
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Input Data</h4>
                            <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
                                {Object.entries(inputData).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            {formatKey(key)}:
                                        </span>
                                        <span className="font-sans">{formatValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weights (if provided) */}
                        {weights && Object.keys(weights).length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Weights Applied</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(weights).map(([factor, weight]) => (
                                        <Badge key={factor} variant="outline" className="text-xs">
                                            {formatKey(factor)}: {weight}%
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Computation Formula */}
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Computation</h4>
                            <div className="bg-muted/50 rounded-md p-3">
                                <code className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {computation}
                                </code>
                            </div>
                        </div>

                        {/* Final Result */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-semibold text-sm">Final {title}</span>
                            <Badge variant="default" className="text-base">
                                {result}
                            </Badge>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

/**
 * Format object key for display
 */
function formatKey(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
    if (Array.isArray(value)) {
        return value.length > 3
            ? `${value.slice(0, 3).join(", ")}... (${value.length} total)`
            : value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}
