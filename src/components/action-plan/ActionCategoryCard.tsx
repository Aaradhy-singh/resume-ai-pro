import React from "react";

export interface ActionItem {
    id: string;
    category: "priority" | "skills" | "certifications" | "portfolio";
    title: string;
    description: string;
    completed: boolean;
    priorityLevel: "critical" | "high" | "medium" | "low";
    estimatedEffort: string;
    recruiterImpact: number;
    triggerReason: string;
}

export const categoryConfig = {
    priority: { label: "Resume Fixes" },
    skills: { label: "Skill Development" },
    certifications: { label: "Certifications" },
    portfolio: { label: "Portfolio Items" },
} as const;

const severityColors: Record<string, string> = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#0EA5E9',
    low: '#10B981',
};

interface ActionCategoryCardProps {
    cat: "priority" | "skills" | "certifications" | "portfolio";
    categoryItems: ActionItem[];
    catIdx: number;
    toggleItem: (id: string) => void;
}

export function ActionCategoryCard({ cat, categoryItems, catIdx, toggleItem }: ActionCategoryCardProps) {
    const config = categoryConfig[cat];

    if (categoryItems.length === 0) return null;

    const completedInCategory = categoryItems.filter(i => i.completed).length;
    const totalInCategory = categoryItems.length;

    return (
        <div style={{ marginBottom: '32px' }}>
            {/* Group header row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #333333',
                marginBottom: '16px',
            }}>
                <div style={{
                    fontFamily: "inherit",
                    fontSize: '12px',
                    color: '#0EA5E9',
                    textTransform: 'uppercase',
                }}>{config.label}</div>
                <div style={{
                    fontFamily: "inherit",
                    fontSize: '12px',
                    color: '#E0E0E0',
                    fontFeatureSettings: '"zero" 0, "ss01" 0, "ss02" 0',
                    fontVariantNumeric: 'normal',
                }}>{completedInCategory}/{totalInCategory}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryItems.map(item => {
                    const severityColor = severityColors[item.priorityLevel] || '#666666';

                    return (
                        <div
                            key={item.id}
                            className={`bg-[#111111] border border-white/20 rounded-xl shadow-lg transition-all duration-300 px-5 py-4 ${item.completed ? 'opacity-70 bg-[#10B981]/5' : ''}`}
                            style={{
                                borderLeft: item.completed ? '4px solid #10B981' : `4px solid ${severityColor}`,
                            }}
                        >
                            {/* Row 1: Checkbox + Title + Priority */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                    role="checkbox"
                                    aria-checked={item.completed}
                                    onClick={() => toggleItem(item.id)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        minWidth: '16px',
                                        border: item.completed ? '1px solid #10B981' : '1px solid #555555',
                                        background: item.completed ? '#10B981' : '#000000',
                                        borderRadius: '0px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.completed && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#000000" strokeWidth="2" strokeLinecap="square" />
                                        </svg>
                                    )}
                                </div>
                                <div style={{
                                    fontFamily: "inherit",
                                    fontSize: '14px',
                                    color: item.completed ? '#A0A0A0' : '#FFFFFF',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</span>
                                    {!item.completed && (
                                        <span style={{
                                            border: `1px solid ${severityColor}`,
                                            color: severityColor,
                                            fontFamily: "inherit",
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                            borderRadius: '0px',
                                            background: 'transparent',
                                            textTransform: 'uppercase'
                                        }}>
                                            {item.priorityLevel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Description */}
                            <div style={{
                                fontFamily: "inherit",
                                fontSize: '14px',
                                color: '#E0E0E0',
                                marginLeft: '28px',
                                marginTop: '12px',
                                lineHeight: 1.5,
                            }}>
                                {item.description}
                            </div>

                            {/* "WHY THIS WAS FLAGGED" block */}
                            {item.triggerReason && (
                                <div className="bg-[#1A1A1A] border border-gray-500 p-4 mt-3 ml-7">
                                    <div style={{
                                        fontFamily: "inherit",
                                        fontSize: '12px',
                                        color: '#0EA5E9',
                                        textTransform: 'uppercase',
                                        marginBottom: '6px'
                                    }}>
                                        WHY THIS WAS FLAGGED
                                    </div>
                                    <div style={{
                                        fontFamily: "inherit",
                                        fontSize: '13px',
                                        color: '#E0E0E0',
                                        lineHeight: 1.5
                                    }}>
                                        <span style={{ color: '#0EA5E9', marginRight: '6px' }}>→</span>
                                        {item.triggerReason}
                                    </div>
                                </div>
                            )}

                            {item.category === 'skills' && item.title && (
                              <div style={{ marginTop: '16px', marginLeft: '28px' }}>
                                <div style={{
                                  fontFamily: 'inherit', fontSize: '12px', color: '#0EA5E9',
                                  letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px'
                                }}>
                                  WHERE TO LEARN
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  {[
                                    {
                                      label: 'Google',
                                      url: `https://www.google.com/search?q=learn+${encodeURIComponent(item.title.replace(/^(Learn|Acquire|Add)\s+/i, '').replace(/\s+experience$/i, ''))}+tutorial`,
                                    },
                                    {
                                      label: 'YouTube',
                                      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title.replace(/^(Learn|Acquire|Add)\s+/i, '').replace(/\s+experience$/i, ''))}+tutorial`,
                                    },
                                    {
                                      label: 'freeCodeCamp',
                                      url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(item.title.replace(/^(Learn|Acquire|Add)\s+/i, '').replace(/\s+experience$/i, ''))}`,
                                    },
                                    {
                                      label: 'GitHub',
                                      url: `https://github.com/search?q=${encodeURIComponent(item.title.replace(/^(Learn|Acquire|Add)\s+/i, '').replace(/\s+experience$/i, ''))}&type=repositories`,
                                    },
                                  ].map(link => (
                                    <a
                                      key={link.label}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        fontFamily: 'inherit', fontSize: '12px',
                                        color: '#9A9A9A', border: '1px solid #555555',
                                        padding: '4px 10px', textDecoration: 'none',
                                        letterSpacing: '0.05em', transition: 'all 0.15s',
                                        background: 'transparent'
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.color = '#0EA5E9';
                                        e.currentTarget.style.borderColor = '#0EA5E9';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.color = '#9A9A9A';
                                        e.currentTarget.style.borderColor = '#555555';
                                      }}
                                    >
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Footer row: Effort + Impact */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '20px',
                                marginLeft: '28px',
                                paddingTop: '16px',
                                borderTop: '1px solid #444444'
                            }}>
                                <div style={{
                                    fontFamily: "inherit",
                                    fontSize: '13px',
                                }}>
                                    <span style={{ color: '#E0E0E0', marginRight: '8px' }}>EFFORT</span>
                                    <span style={{ color: '#FFFFFF' }}>{item.estimatedEffort}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontFamily: "inherit", fontSize: '13px', color: '#E0E0E0' }}>IMPACT</span>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    background: i < item.recruiterImpact ? '#0EA5E9' : '#333333',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
