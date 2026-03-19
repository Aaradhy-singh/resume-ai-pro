import { useState } from 'react';
import type { Industry } from '@/lib/occupation-types';

interface IndustryBrowserProps {
  industries: Industry[];
  selectedIndustry: string | null;
  onSelectIndustry: (id: string) => void;
}

export function IndustryBrowser({ industries, selectedIndustry, onSelectIndustry }: IndustryBrowserProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '10px',
        color: '#6B6B6B',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '16px'
      }}>SELECT AN INDUSTRY</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '6px'
      }}>
        {industries.map((industry) => {
          const isSelected = selectedIndustry === industry.id;
          const isHovered = hoveredId === industry.id;
          const isActive = isSelected || isHovered;
          return (
            <div
              key={industry.id}
              onClick={() => onSelectIndustry(industry.id)}
              onMouseEnter={() => setHoveredId(industry.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isSelected ? '#0A1420' : '#0D0D0D',
                border: `1px solid ${isActive ? '#0EA5E9' : '#1F1F1F'}`,
                padding: '16px',
                cursor: 'pointer',
                transition: 'border-color 150ms ease'
              }}
            >
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '18px',
                color: isActive ? '#0EA5E9' : '#3A3A3A',
                fontWeight: 300,
                marginBottom: '8px',
                transition: 'color 150ms ease',
                lineHeight: 1
              }}>{industry.name.slice(0, 2).toUpperCase()}</p>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                color: '#F0F0F0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1.4,
                marginBottom: '6px'
              }}>{industry.name}</p>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '10px',
                color: '#6B6B6B'
              }}>{industry.roleCount} role{industry.roleCount !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
