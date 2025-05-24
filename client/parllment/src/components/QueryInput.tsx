import React from 'react';

interface QueryInputProps {
  value: string;
  onChange(v: string): void;
  onSubmit(v: string): void;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="query-input">
      <input
        className="newsletter-font"
        type="text"
        placeholder="Ask Parllment..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
