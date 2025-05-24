import React from 'react';
import type { MPWithOpinion } from '../interfaces/MP';
import './MPPicker.css';

interface MPPickerItemProps {
  mp: MPWithOpinion;
  isSelected: boolean;
  onSelect(mp: MPWithOpinion): void;
}

const getMoodClass = (mp: MPWithOpinion): string => {
  const { rating, snippet } = mp;
  if (!snippet) return 'neutral';
  if (rating <= 20) return 'strongly-disagree';
  if (rating <= 40) return 'slightly-disagree';
  if (rating <= 60) return 'neutral';
  if (rating <= 80) return 'slightly-agree';
  return 'strongly-agree';
};

export const MPPickerItem: React.FC<MPPickerItemProps> = ({
  mp,
  isSelected,
  onSelect,
}) => {
  const moodClass = getMoodClass(mp);
  const tooltipText = mp.snippet || 'No query asked';

  return (
    <div
      className={`mp-thumb ${moodClass} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(mp)}
    >
      <div className="thumb-img-container">
        <img src={mp.imageUrl} alt={mp.name} />
      </div>
      <div className="thumb-name">{mp.name}</div>
      <div className="thumb-interests">
        {mp.interests.map((interest, idx) => (
          <span key={idx} className="interest-pill">{interest}</span>
        ))}
      </div>
      <div className="tooltip">
        {tooltipText}
        <span className="tooltip-arrow" />
      </div>
    </div>
  );
};

interface MPPickerProps {
  mps: MPWithOpinion[];
  selected: MPWithOpinion | null;
  onSelect(mp: MPWithOpinion): void;
}

export const MPPicker: React.FC<MPPickerProps> = ({
  mps,
  selected,
  onSelect,
}) => (
  <div className="mp-grid">
    {mps.map((mp) => (
      <MPPickerItem
        key={mp.name}
        mp={mp}
        isSelected={selected?.name === mp.name}
        onSelect={onSelect}
      />
    ))}
  </div>
);
