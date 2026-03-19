import { AlertTriangle } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface UnrecognizedTermsAlertProps {
    terms?: string[];
}

export function UnrecognizedTermsAlert({ terms }: UnrecognizedTermsAlertProps) {
    if (!terms || terms.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="w-full border rounded-lg bg-card">
            <AccordionItem value="unrecognized-terms" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-left">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                            <h3 className="font-semibold text-lg text-foreground">Unrecognized Terms</h3>
                            <p className="text-sm text-muted-foreground font-normal mt-0.5">
                                {terms.length} term{terms.length !== 1 ? 's' : ''} excluded from scoring
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                        These terms were not recognized by our skill database and were excluded from scoring. If they are relevant skills, they may be affecting your score.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {terms.map((term: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border">
                                {term}
                            </span>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
