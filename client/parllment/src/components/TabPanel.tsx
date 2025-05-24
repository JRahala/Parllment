import React from 'react';

export type TabKey = 'mp' | 'commentary' | 'debate' | 'stakeholder';

interface TabPanelProps {
  active: TabKey;
  onChange(t: TabKey): void;
  onSearch?(q: string): void;
}

export const TabPanel: React.FC<React.PropsWithChildren<TabPanelProps>> = ({
  active,
  onChange,
  onSearch,
  children,
}) => {
  const tabKeys: TabKey[] = ['mp', 'commentary', 'debate', 'stakeholder'];

  return (
    <div className="tab-panel">
      <div className="tab-header">
        {onSearch && (
          <input
            className="search-input"
            type="search"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
        )}
        <nav className="tabs">
          {tabKeys.map((t) => (
            <button
              key={t}
              className={t === active ? 'active' : ''}
              onClick={() => onChange(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  );
};
