import React from 'react';
import type { MP } from '../interfaces/MP';
import type { Commentator } from '../interfaces/Commentator';

export interface Message {
  id: string;
  sender: string;
  senderType: 'mp' | 'commentator';
  text: string;
}

export interface DebateSectionProps {
  mode: 'commentary' | 'mp';
  messages: Message[];
  participants: Array<
    (MP & { position: number }) | (Commentator & { position: number })
  >;
  gradient: string;
}

export const DebateSection: React.FC<DebateSectionProps> = ({
  mode,
  messages,
  participants,
  gradient,
}) => (
  <div className="debate-section">
    <div className="debate-messages">
      {messages.map((msg) => {
        const participant = participants.find(p => p.name === msg.sender);

        return (
          <div key={msg.id} className="debate-message">
            <div className="debate-avatar">
              {participant?.imageUrl && (
                <img src={participant.imageUrl} alt={msg.sender} />
              )}
            </div>
            <div className="debate-content">
              <strong className="debate-sender">{msg.sender}</strong>
              <p className="debate-text">{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
