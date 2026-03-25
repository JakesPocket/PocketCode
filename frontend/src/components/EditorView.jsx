export default function EditorView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-vscode-text-muted mb-4">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      <p className="text-sm text-vscode-text-muted">
        CodeMirror 6 editor will appear here.
      </p>
    </div>
  );
}
