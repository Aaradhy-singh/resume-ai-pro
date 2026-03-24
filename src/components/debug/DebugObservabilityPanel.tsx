import React, { useState, useEffect } from 'react';
import { globalBenchmark } from '@/lib/verification/performance-benchmark';
// Dynamic imports used in runFullAudit to break cycles
import { type DeterminismReport } from '@/lib/verification/determinism-test';
import { type AdversarialResult } from '@/lib/verification/adversarial-suite';
import { type ParsedResume } from '@/lib/parsers/resumeParser';

interface DebugPanelProps {
    lastResult?: any;
    sampleResume?: ParsedResume;
}

export const DebugObservabilityPanel: React.FC<DebugPanelProps> = ({ lastResult, sampleResume }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [detReport, setDetReport] = useState<DeterminismReport | null>(null);
    const [advResults, setAdvResults] = useState<AdversarialResult[]>([]);

    if (!import.meta.env.DEV) return null;

    const runFullAudit = async () => {
        if (!sampleResume) return;
        setIsTesting(true);
        try {
            const { runDeterminismTest } = await import('@/lib/verification/determinism-test');
            const { runAdversarialSuite } = await import('@/lib/verification/adversarial-suite');

            const dr = await runDeterminismTest(sampleResume);
            setDetReport(dr);
            const ar = await runAdversarialSuite(sampleResume);
            setAdvResults(ar);
        } catch (e) {
            console.error("Audit failed:", e);
        } finally {
            setIsTesting(false);
        }
    };

    const metrics = globalBenchmark.getAllMetrics();

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {!isVisible ? (
                import.meta.env.DEV && (
                    <button
                        onClick={() => setIsVisible(true)}
                        className="bg-black border border-[#0EA5E9] text-[#0EA5E9] text-[10px] font-mono px-3 py-1 uppercase tracking-tighter"
                    >
                        System Debug
                    </button>
                )
            ) : (
                <div className="bg-black border border-[#2A2A2A] w-[400px] max-h-[600px] overflow-y-auto p-4 font-mono text-[10px] shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-[#2A2A2A] pb-2">
                        <span className="text-white uppercase">VERIFICATION PANEL</span>
                        <button onClick={() => setIsVisible(false)} className="text-[#666] hover:text-white">✕</button>
                    </div>

                    <div className="space-y-6">
                        {/* 1. PERFORMANCE */}
                        <section>
                            <h3 className="text-[#0EA5E9] mb-2">● PERFORMANCE BENCHMARKS</h3>
                            <div className="grid grid-cols-2 gap-2 text-[#888]">
                                {Object.entries(metrics).map(([name, m]) => (
                                    <div key={name} className="border border-[#1A1A1A] p-2">
                                        <div className="text-white text-[9px] truncate mb-1">{name}</div>
                                        <div className="flex justify-between">
                                            <span>P95:</span>
                                            <span className={m.p95 > 150 ? 'text-red-500' : 'text-green-500'}>{m.p95}ms</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>MEAN:</span>
                                            <span>{m.mean}ms</span>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(metrics).length === 0 && <div className="col-span-2 text-[#444]">No metrics recorded.</div>}
                            </div>
                        </section>

                        {/* 2. DETERMINISM */}
                        <section>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[#0EA5E9]">● DETERMINISM (100-RUN)</h3>
                                <button
                                    onClick={runFullAudit}
                                    disabled={isTesting || !sampleResume}
                                    className="text-[9px] bg-[#0EA5E9] text-black px-2 py-0.5 disabled:opacity-50"
                                >
                                    {isTesting ? 'RUNNING...' : 'START AUDIT'}
                                </button>
                            </div>
                            {detReport ? (
                                <div className={`p-2 border ${detReport.passed ? 'border-green-900 bg-green-950/20' : 'border-red-900 bg-red-950/20'}`}>
                                    <div className="flex justify-between mb-1">
                                        <span>STATUS:</span>
                                        <span className={detReport.passed ? 'text-green-500' : 'text-red-500'}>
                                            {detReport.passed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                    <div className="text-[#666] text-[8px] truncate">HASH: {detReport.hashes[0]}</div>
                                    {!detReport.passed && <div className="text-red-400 mt-1 italic">{detReport.diff}</div>}
                                </div>
                            ) : (
                                <div className="text-[#444]">Not yet tested.</div>
                            )}
                        </section>

                        {/* 3. ADVERSARIAL */}
                        <section>
                            <h3 className="text-[#0EA5E9] mb-2">● ADVERSARIAL RESILIENCE</h3>
                            <div className="space-y-1">
                                {advResults.map((r, i) => (
                                    <div key={i} className="flex justify-between border-b border-[#1A1A1A] py-1">
                                        <span className="truncate pr-2">{r.caseName}:</span>
                                        <span className={r.passed ? 'text-green-500' : 'text-red-500'}>
                                            {r.passed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                ))}
                                {advResults.length === 0 && <div className="text-[#444]">Not yet tested.</div>}
                            </div>
                        </section>

                        {/* 4. RUNTIME STATE */}
                        <section>
                            <h3 className="text-[#0EA5E9] mb-2">● LIVE ORCHESTRATOR STATE</h3>
                            <div className="bg-[#0D0D0D] p-2 text-[#888] space-y-1">
                                <div className="flex justify-between">
                                    <span>TIMESTAMP:</span>
                                    <span className="text-white">{lastResult?.meta?.timestamp || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ERRORS:</span>
                                    <span className={lastResult?.meta?.pipelineErrors?.length > 0 ? 'text-red-400' : 'text-green-500'}>
                                        {lastResult?.meta?.pipelineErrors?.length || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>EVIDENCE:</span>
                                    <span>{lastResult?.evidenceStrength?.overallScore || 0}%</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};
