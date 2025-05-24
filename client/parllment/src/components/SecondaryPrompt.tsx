import React from 'react';

interface SecondaryPromptProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
}

export const SecondaryPrompt: React.FC<SecondaryPromptProps> = ({
  value,
  onChange,
  onSubmit,
}) => (
  <div className="secondary-prompt">
    <input
      type="text"
      placeholder="Ask a follow-up question…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit?.();
        }
      }}
    />
  </div>
);