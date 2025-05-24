import React from 'react';

export interface ScalePointer {
  id: string;
  position: number;
}

export interface ScaleProps {
  gradient: string;
  pointers: ScalePointer[];
}

export const Scale: React.FC<ScaleProps> = ({ gradient, pointers }) => (
  <div className="scale-container">
    <div className="scale-bar" style={{ background: gradient }} />
    {pointers.map((p) => (
      <div
        key={p.id}
        className="scale-pointer"
        style={{ left: `${p.position * 100}%` }}
      />
    ))}
  </div>
);
