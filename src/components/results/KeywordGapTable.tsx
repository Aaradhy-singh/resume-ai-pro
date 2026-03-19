import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, AlertTriangle } from "lucide-react";
import type { GapAnalysisResult } from "@/lib/engines/keyword-gap-analysis";

interface KeywordGapTableProps {
  data: GapAnalysisResult;
}

export function KeywordGapTable({ data }: KeywordGapTableProps) {
  if (!data.safeToDisplay || data.totalGaps === 0) {
    return null; // Don't show if no JD or no gaps
  }

  // Combine critical and important gaps for display
  const allGaps = [
    ...data.criticalGaps.map(g => ({ ...g, priority: 'Critical' })),
    ...data.importantGaps.map(g => ({ ...g, priority: 'Important' }))
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Keyword Gap Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Found {data.totalGaps} missing keywords from the job description
            </CardDescription>
          </div>
          <Badge variant={data.matchScore > 80 ? "default" : "secondary"}>
            {data.matchScore}% Match Score
          </Badge>
        </div>
      </CardHeader>
      <CardContent>

        {/* Genuine vs Mention Gap Split (Layer 5) */}
        {data.safeToDisplay && (data.genuineGaps.length > 0 || data.mentionGaps.length > 0) && (
          <div style={{ marginBottom: '20px' }}>

            {/* Genuine gaps — must learn */}
            {data.genuineGaps.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px 14px',
                  background: '#1A0A0A',
                  border: '1px solid #3A1A1A'
                }}>
                  <span style={{ color: '#EF4444', fontSize: '12px' }}>●</span>
                  <div>
                    <p style={{
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      color: '#EF4444',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}>
                      SKILL GAPS — GO LEARN THESE ({data.genuineGaps.length})
                    </p>
                    <p style={{
                      fontFamily: 'inherit',
                      fontSize: '10px',
                      color: '#FFFFFF',
                      marginTop: '2px'
                    }}>
                      No evidence of these skills anywhere on your resume.
                      These represent genuine learning requirements.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 4px' }}>
                  {data.genuineGaps.map(gap => (
                    <span key={gap.keyword} style={{
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      color: '#EF4444',
                      background: '#1A0808',
                      border: '1px solid #3A1A1A',
                      padding: '4px 10px'
                    }}>{gap.keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Mention gaps — just add to resume */}
            {data.mentionGaps.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px 14px',
                  background: '#0A1A0A',
                  border: '1px solid #1A3A1A'
                }}>
                  <span style={{ color: '#10B981', fontSize: '12px' }}>●</span>
                  <div>
                    <p style={{
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      color: '#10B981',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}>
                      MENTION GAPS — JUST ADD TO RESUME ({data.mentionGaps.length})
                    </p>
                    <p style={{
                      fontFamily: 'inherit',
                      fontSize: '10px',
                      color: '#FFFFFF',
                      marginTop: '2px'
                    }}>
                      Related skills detected on your resume.
                      You likely know these — just haven't listed them explicitly.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 4px' }}>
                  {data.mentionGaps.map(gap => (
                    <span key={gap.keyword} style={{
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      color: '#10B981',
                      background: '#081A08',
                      border: '1px solid #1A3A1A',
                      padding: '4px 10px'
                    }}>{gap.keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Missing Keyword</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-center">JD Freq</TableHead>
              <TableHead>Context from JD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allGaps.map((gap, i) => (
              <TableRow key={i} className={gap.category === 'critical' ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    {gap.keyword}
                    {gap.category === 'critical' && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={gap.category === 'critical' ? "destructive" : "outline"}>
                    {gap.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-sans">{gap.frequency}x</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[300px] truncate" title={gap.context[0]}>
                  {gap.context[0] || "No context found"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
