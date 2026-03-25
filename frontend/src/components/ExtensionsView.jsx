import { useState } from 'react';

const SUB_TABS = [
  { id: 'file-explorer', label: 'File Explorer' },
  { id: 'source-control', label: 'Source Control' },
];

export default function ExtensionsView() {
  const [activeSubTab, setActiveSubTab] = useState('file-explorer');

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <div
        className="flex shrink-0 border-b border-vscode-border"
        style={{ backgroundColor: 'var(--color-vscode-sidebar)' }}
      >
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer border-none outline-none min-h-[44px] ${
                isActive
                  ? 'text-white border-b-2 border-b-vscode-accent'
                  : 'text-vscode-text-muted hover:text-vscode-text'
              }`}
              style={{ backgroundColor: 'transparent' }}
              aria-label={tab.label}
              aria-current={isActive ? 'true' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSubTab === 'file-explorer' ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-vscode-text-muted mb-3">
              Explorer
            </h2>
            <p className="text-sm text-vscode-text-muted">
              File explorer will appear here.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-vscode-text-muted mb-3">
              Source Control
            </h2>
            <p className="text-sm text-vscode-text-muted">
              Git commit and push controls will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
