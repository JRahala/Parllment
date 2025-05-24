import React from 'react';

export interface SupportBreakdownCounts {
  stronglySupport: number;
  slightlySupport: number;
  neutral: number;
  slightlyDisagree: number;
  stronglyDisagree: number;
}

interface SupportBreakdownBarProps {
  counts: SupportBreakdownCounts;
}

const SupportBreakdownBar: React.FC<SupportBreakdownBarProps> = ({ counts }) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const getPercent = (count: number) => ((count / total) * 100).toFixed(1);

  const segments = [
    { label: 'Strongly Support', color: '#4caf50', count: counts.stronglySupport },
    { label: 'Slightly Support', color: '#81c784', count: counts.slightlySupport },
    { label: 'Neutral', color: '#b0bec5', count: counts.neutral },
    { label: 'Slightly Disagree', color: '#ffb74d', count: counts.slightlyDisagree },
    { label: 'Strongly Disagree', color: '#e57373', count: counts.stronglyDisagree },
  ];

  return (
    <div style={{ marginBottom: 16, background: '#f5f6f8', padding: 12, borderRadius: 8 }}>
      <h4 style={{ marginBottom: 8 }}>Motion Support Breakdown</h4>
      <div style={{
        display: 'flex',
        height: 30,
        borderRadius: 6,
        overflow: 'hidden',
        background: '#e0e0e0',
        fontSize: '0.6rem',
        color: 'black',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        {segments.map(({ label, color, count }) => {
          const percent = getPercent(count);
          const width = parseFloat(percent);
          if (width < 2) return null;

          return (
            <div
              key={label}
              style={{
                width: `${percent}%`,
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {count} ({percent}%)
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupportBreakdownBar;
