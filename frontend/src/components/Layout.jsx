const TAB_ITEMS = [
  {
    id: 'extensions',
    label: 'Extensions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
        <path d="M17.5 14v3.5H14V21h3.5v-3.5H21V14z" />
      </svg>
    ),
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export default function Layout({ activeTab, onTabChange, children }) {
  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        className="flex shrink-0 border-t border-vscode-border"
        style={{ backgroundColor: 'var(--color-vscode-nav)' }}
      >
        {TAB_ITEMS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors cursor-pointer border-none outline-none ${
                isActive
                  ? 'text-vscode-accent'
                  : 'text-vscode-text-muted hover:text-vscode-text'
              }`}
              style={{ backgroundColor: 'transparent' }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span className="text-[10px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
