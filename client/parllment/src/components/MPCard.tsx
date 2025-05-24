import React from 'react';
import type { MPWithOpinion } from '../interfaces/MP';
import './MPCard.css';

export interface MPCardProps {
  mp: MPWithOpinion;
  explanation?: string;
  tags?: string[];
  followUpQ?: string;
  followUpResponse?: string;
}

export const MPCard: React.FC<MPCardProps> = ({
  mp,
  explanation,
  tags = [],
  followUpQ,
  followUpResponse,
}) => (
  <div className="mp-card">
    <h2 className="mp-card-title">{mp.name}</h2>

    {mp.imageUrl && (
      <img className="mp-card-img" src={mp.imageUrl} alt={mp.name} />
    )}

    <p><strong>Party:</strong> {mp.political_party}</p>

    <div className="mp-interests">
      <strong>Interests:</strong>
      <div className="interest-capsules">
        {mp.interests.map((interest, i) => (
          <span key={i} className="interest-pill">{interest}</span>
        ))}
      </div>
    </div>

    <p className="snippet">
      <strong>Supports this {mp.rating}%:</strong> <em>“{mp.snippet}”</em>
    </p>

    <p className="explanation-text">
      <strong className="inline-label">Why they think this:</strong> {explanation}
    </p>

    {tags.length > 0 && (
      <div className="tag-capsules">
        {tags.map((tag, i) => (
          <span key={i} className="tag-pill">{tag}</span>
        ))}
      </div>
    )}

    {(followUpQ || followUpResponse) && (
      <div className="mp-followup-chat">
        {followUpQ && (
          <div className="followup-user">
            <strong>You:</strong> {followUpQ}
          </div>
        )}
        {followUpResponse && (
          <div className="followup-mp">
            <strong>{mp.name}:</strong> {followUpResponse}
          </div>
        )}
      </div>
    )}
  </div>
);
