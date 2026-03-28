import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../config/server';
import { readText, writeText } from '../utils/persist';

const EXTENSIONS_TAB_KEY = 'pocketide.extensions.activeSubTab.v1';

function IconFolder({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4 shrink-0 text-yellow-400" aria-hidden="true">
      {open
        ? <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        : <>
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </>
      }
    </svg>
  );
}

function IconFileSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4 shrink-0 text-vscode-text-muted" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

const FILE_TYPE_STYLE = {
  js: { label: 'JS', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  jsx: { label: 'JSX', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  ts: { label: 'TS', className: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  tsx: { label: 'TSX', className: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  py: { label: 'PY', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  html: { label: 'HTML', className: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  css: { label: 'CSS', className: 'bg-blue-400/20 text-blue-200 border-blue-400/40' },
  json: { label: 'JSON', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  md: { label: 'MD', className: 'bg-slate-500/20 text-slate-200 border-slate-500/40' },
  yml: { label: 'YAML', className: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  yaml: { label: 'YAML', className: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  sh: { label: 'SH', className: 'bg-lime-500/20 text-lime-300 border-lime-500/40' },
  dockerfile: { label: 'DKR', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  default: { label: 'FILE', className: 'bg-vscode-sidebar text-vscode-text-muted border-vscode-border' },
};

function getFileTypeStyle(fileName = '') {
  const lower = fileName.toLowerCase();
  if (lower === 'dockerfile') return FILE_TYPE_STYLE.dockerfile;
  const ext = lower.includes('.') ? lower.split('.').pop() : '';
  return FILE_TYPE_STYLE[ext] || FILE_TYPE_STYLE.default;
}

function FileTypeIcon({ name }) {
  const style = getFileTypeStyle(name);
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[28px] h-4 px-1 rounded border text-[9px] font-semibold tracking-wide ${style.className}`}
      aria-hidden="true"
    >
      {style.label}
    </span>
  );
}

function IconChevron({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
      aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/** Recursive file tree node */
function FileNode({ node, depth = 0, onOpenFile }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const indent = depth * 12 + 12;

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ paddingLeft: indent, background: 'none', border: 'none', outline: 'none' }}
          className="w-full flex items-center gap-1.5 h-[36px] min-h-[36px] text-vscode-text
                     hover:bg-vscode-sidebar-hover cursor-pointer transition-colors"
        >
          <IconChevron open={expanded} />
          <IconFolder open={expanded} />
          <span className="text-sm truncate">{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileNode key={child.path} node={child} depth={depth + 1} onOpenFile={onOpenFile} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpenFile({ path: node.path, name: node.name })}
      style={{ paddingLeft: indent + 16, background: 'none', border: 'none', outline: 'none' }}
      className="w-full flex items-center gap-2 h-[44px] min-h-[44px] text-vscode-text
                 hover:bg-vscode-sidebar-hover cursor-pointer transition-colors"
    >
      <FileTypeIcon name={node.name} />
      <span className="text-sm truncate">{node.name}</span>
    </button>
  );
}

const STATUS_LABEL = { M: 'modified', A: 'added', D: 'deleted', R: 'renamed', C: 'copied', U: 'unmerged', '?': 'untracked' };
const STATUS_COLOR = { M: 'text-yellow-400', A: 'text-green-400', D: 'text-red-400', R: 'text-blue-400', C: 'text-blue-400', U: 'text-red-400', '?': 'text-vscode-text-muted' };

function GitFileBadge({ status }) {
  const color = STATUS_COLOR[status] || 'text-vscode-text-muted';
  return <span className={`text-[10px] font-bold uppercase ${color} shrink-0`}>{STATUS_LABEL[status] || status}</span>;
}

function GitSection({ title, files, action, actionLabel, busy }) {
  if (!files.length) return null;
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-vscode-text-muted">
          {title} <span className="font-normal normal-case tracking-normal opacity-70">({files.length})</span>
        </span>
        {action && (
          <button
            onClick={action}
            disabled={busy}
            className="text-[11px] text-vscode-text-muted hover:text-vscode-text cursor-pointer disabled:opacity-40"
            style={{ background: 'none', border: 'none', outline: 'none' }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {files.map((f) => (
        <div
          key={f.path}
          className="flex items-center justify-between px-3 h-[40px] min-h-[40px]
                     hover:bg-vscode-sidebar-hover transition-colors gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileTypeIcon name={f.path.split('/').pop()} />
            <span className="text-sm truncate text-vscode-text min-w-0">
              {f.path.split('/').pop()}
            </span>
          </div>
          <GitFileBadge status={f.status} />
        </div>
      ))}
    </div>
  );
}

function GitView() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('.');
  const [gitStatus, setGitStatus] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [pendingBranchSwitch, setPendingBranchSwitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commitMsg, setCommitMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchRepos = useCallback(() => {
    fetch(apiUrl('/api/git/repos'))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data.repos) ? data.repos : [];
        setRepos(list);
        if (!list.some((repo) => repo.id === selectedRepo)) {
          setSelectedRepo(list[0]?.id || '.');
        }
      })
      .catch(() => setRepos([]));
  }, [selectedRepo]);

  const fetchStatus = useCallback(() => {
    setLoading(true);
    setError(null);
    const query = selectedRepo ? `?repo=${encodeURIComponent(selectedRepo)}` : '';
    fetch(apiUrl(`/api/git/status${query}`))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => setGitStatus(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedRepo]);

  const fetchBranches = useCallback(() => {
    const query = selectedRepo ? `?repo=${encodeURIComponent(selectedRepo)}` : '';
    fetch(apiUrl(`/api/git/branches${query}`))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => setBranches(Array.isArray(data.branches) ? data.branches : []))
      .catch(() => setBranches([]));
  }, [selectedRepo]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  useEffect(() => {
    fetchStatus();
    fetchBranches();
  }, [fetchStatus, fetchBranches]);

  async function gitAction(endpoint, body = {}) {
    setBusy(true);
    setActionMsg('');
    try {
      const r = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, repo: selectedRepo }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setActionMsg(data.error || `Failed (${r.status})`);
        return false;
      } else {
        if (data.output) setActionMsg(data.output);
        fetchStatus();
        fetchBranches();
        return true;
      }
    } catch (e) {
      setActionMsg(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleStageAll() { await gitAction('/api/git/stage', { all: true }); }
  async function handleUnstageAll() { await gitAction('/api/git/unstage', { all: true }); }
  async function handleCommit() {
    if (!commitMsg.trim()) return;
    await gitAction('/api/git/commit', { message: commitMsg });
    setCommitMsg('');
  }
  async function handleGenerateCommitMessage() {
    setBusy(true);
    setActionMsg('');
    try {
      const r = await fetch(apiUrl('/api/git/generate-commit-message'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: selectedRepo }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setActionMsg(data.error || `Failed (${r.status})`);
        return;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        setCommitMsg(data.message.trim());
        setActionMsg(data.source === 'ai' ? 'Generated commit message with AI.' : 'Generated commit message.');
      }
    } catch (e) {
      setActionMsg(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function handlePush() { await gitAction('/api/git/push'); }
  async function handlePull() { await gitAction('/api/git/pull'); }

  async function switchBranch(targetBranch, strategy = null, remote = false) {
    setBusy(true);
    setActionMsg('');
    try {
      const r = await fetch(apiUrl('/api/git/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: targetBranch, remote, repo: selectedRepo, ...(strategy ? { strategy } : {}) }),
      });
      const data = await r.json().catch(() => ({}));

      if (r.status === 409 && data?.conflict) {
        setPendingBranchSwitch({ branch: targetBranch, remote });
        setActionMsg('This branch switch needs a strategy: Stash or Discard changes.');
        return;
      }

      if (!r.ok) {
        setActionMsg(data.error || `Failed (${r.status})`);
        return;
      }

      setPendingBranchSwitch(null);
      setShowBranchPicker(false);
      if (data.warning) {
        setActionMsg(data.warning);
      } else {
        setActionMsg(data.output || `Switched to ${targetBranch}`);
      }
      fetchStatus();
      fetchBranches();
    } catch (e) {
      setActionMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSelectBranch(target) {
    if (!target?.fullName) return;

    const targetBranch = target.fullName;
    const isCurrentLocal = !target.remote && target.name === gitStatus?.branch;
    if (isCurrentLocal) {
      setShowBranchPicker(false);
      return;
    }

    const hasUncommitted = (gitStatus?.staged?.length || 0) + (gitStatus?.unstaged?.length || 0) + (gitStatus?.untracked?.length || 0) > 0;
    if (hasUncommitted) {
      setPendingBranchSwitch({ branch: targetBranch, remote: Boolean(target.remote) });
      setShowBranchPicker(false);
      return;
    }

    await switchBranch(targetBranch, null, Boolean(target.remote));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-4 text-vscode-text-muted text-sm">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-6.22-8.56" strokeLinecap="round" />
        </svg>
        Loading…
      </div>
    );
  }

  if (error) {
    return <p className="px-3 py-4 text-sm text-red-400">Error: {error}</p>;
  }

  if (!gitStatus?.branch) {
    return (
      <div className="px-3 py-4 text-sm text-vscode-text-muted">
        Not a git repository.
      </div>
    );
  }

  const { repoName, branch, ahead, behind, staged, unstaged, untracked } = gitStatus;
  const localBranches = branches.filter((b) => !b.remote);
  const remoteBranches = branches.filter((b) => b.remote);
  const hasChanges = staged.length + unstaged.length + untracked.length > 0;
  const canCommit = staged.length > 0 && commitMsg.trim().length > 0;
  const canGenerateCommitMsg = staged.length > 0 && !busy;
  const hasMessage = commitMsg.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {repos.length > 1 && (
        <div className="px-3 py-2 border-b border-vscode-border bg-vscode-sidebar flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-vscode-text-muted shrink-0">Repository</span>
          <select
            value={selectedRepo}
            onChange={(e) => {
              setSelectedRepo(e.target.value);
              setShowBranchPicker(false);
              setPendingBranchSwitch(null);
            }}
            className="flex-1 bg-vscode-bg border border-vscode-border rounded px-2 py-1 text-xs text-vscode-text"
            style={{ outline: 'none' }}
          >
            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name} ({repo.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Branch row */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-vscode-border shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-vscode-text-muted">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 01-9 9" />
          </svg>
          {repoName && (
            <>
              <span className="text-sm text-vscode-text-muted truncate shrink-0">{repoName}</span>
              <span className="text-vscode-text-muted opacity-40 shrink-0">/</span>
            </>
          )}
          <button
            onClick={() => {
              fetchBranches();
              setShowBranchPicker((v) => !v);
            }}
            disabled={busy}
            className="flex items-center gap-1 text-sm text-vscode-text truncate hover:text-white disabled:opacity-40"
            style={{ background: 'none', border: 'none', outline: 'none' }}
            title="Switch branch"
          >
            <span className="truncate">{branch}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className={`w-3 h-3 shrink-0 transition-transform ${showBranchPicker ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {ahead > 0 && <span className="text-[11px] text-green-400 shrink-0">↑{ahead}</span>}
          {behind > 0 && <span className="text-[11px] text-yellow-400 shrink-0">↓{behind}</span>}
        </div>
        <button
          onClick={fetchStatus}
          disabled={busy}
          title="Refresh"
          style={{ background: 'none', border: 'none', outline: 'none' }}
          className="text-vscode-text-muted hover:text-vscode-text cursor-pointer p-1 disabled:opacity-40 shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {showBranchPicker && (
        <div className="px-3 py-2 border-b border-vscode-border bg-vscode-sidebar">
          {branches.length === 0 ? (
            <p className="text-xs text-vscode-text-muted">No branches found.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {localBranches.length > 0 && (
                <p className="text-[10px] uppercase tracking-wider text-vscode-text-muted px-1 pt-1">Local branches</p>
              )}
              {localBranches.map((b) => (
                <button
                  key={`local:${b.fullName}`}
                  onClick={() => handleSelectBranch(b)}
                  disabled={busy || b.current}
                  className={[
                    'text-left px-2 py-1.5 rounded text-xs border border-vscode-border transition-colors',
                    b.current
                      ? 'text-vscode-text bg-vscode-bg opacity-70 cursor-default'
                      : 'text-vscode-text-muted hover:text-vscode-text hover:bg-vscode-bg cursor-pointer',
                  ].join(' ')}
                  style={{ outline: 'none' }}
                >
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <span className="truncate">{b.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {b.current && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-green-500/40 text-green-400">
                          Current
                        </span>
                      )}
                      {b.upstream && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-vscode-border text-vscode-text-muted">
                          {b.upstream}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {remoteBranches.length > 0 && (
                <p className="text-[10px] uppercase tracking-wider text-vscode-text-muted px-1 pt-2">Remote branches</p>
              )}
              {remoteBranches.map((b) => (
                <button
                  key={`remote:${b.fullName}`}
                  onClick={() => handleSelectBranch(b)}
                  disabled={busy}
                  className="text-left px-2 py-1.5 rounded text-xs border border-vscode-border transition-colors text-vscode-text-muted hover:text-vscode-text hover:bg-vscode-bg cursor-pointer"
                  style={{ outline: 'none' }}
                >
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <span className="truncate">{b.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-vscode-border text-vscode-text-muted shrink-0">
                      Remote
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {pendingBranchSwitch && (
        <div className="px-3 py-2 border-b border-vscode-border bg-vscode-sidebar">
          <p className="text-xs text-vscode-text-muted mb-2">
            Uncommitted changes detected before switching to <span className="text-vscode-text">{pendingBranchSwitch.branch}</span>.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => switchBranch(pendingBranchSwitch.branch, 'stash', pendingBranchSwitch.remote)}
              disabled={busy}
              className="flex-1 py-1.5 rounded text-xs border border-vscode-border text-vscode-text hover:bg-vscode-bg disabled:opacity-40"
              style={{ background: 'transparent', outline: 'none' }}
            >
              Stash &amp; Switch
            </button>
            <button
              onClick={() => switchBranch(pendingBranchSwitch.branch, 'force', pendingBranchSwitch.remote)}
              disabled={busy}
              className="flex-1 py-1.5 rounded text-xs border border-vscode-border text-red-300 hover:bg-vscode-bg disabled:opacity-40"
              style={{ background: 'transparent', outline: 'none' }}
            >
              Discard &amp; Switch
            </button>
            <button
              onClick={() => setPendingBranchSwitch(null)}
              disabled={busy}
              className="px-2 py-1.5 rounded text-xs border border-vscode-border text-vscode-text-muted hover:text-vscode-text disabled:opacity-40"
              style={{ background: 'transparent', outline: 'none' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scrollable changes + actions */}
      <div className="flex-1 overflow-y-auto">
        {!hasChanges && (
          <p className="px-3 py-4 text-sm text-vscode-text-muted">No changes.</p>
        )}

        <GitSection
          title="Staged"
          files={staged}
          action={staged.length ? handleUnstageAll : null}
          actionLabel="Unstage all"
          busy={busy}
        />
        <GitSection
          title="Changes"
          files={unstaged}
          action={unstaged.length ? handleStageAll : null}
          actionLabel="Stage all"
          busy={busy}
        />
        <GitSection
          title="Untracked"
          files={untracked}
          action={untracked.length ? handleStageAll : null}
          actionLabel="Stage all"
          busy={busy}
        />

        {/* Commit area */}
        {staged.length > 0 && (
          <div className="px-3 pt-3 pb-2 border-t border-vscode-border mt-1">
            <div className="mb-2.5 p-2 rounded border border-vscode-border bg-vscode-sidebar">
              <div className="text-[11px] uppercase tracking-wider text-vscode-text-muted mb-1.5">Commit flow</div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded border px-2 py-1 border-vscode-border text-vscode-text">
                  <div className="font-medium">1. Stage</div>
                  <div className="text-vscode-text-muted">{staged.length} staged</div>
                </div>
                <div className={[
                  'rounded border px-2 py-1',
                  hasMessage ? 'border-green-500/40 text-vscode-text' : 'border-vscode-border text-vscode-text-muted',
                ].join(' ')}>
                  <div className="font-medium">2. Message</div>
                  <div>{hasMessage ? 'ready' : 'required'}</div>
                </div>
                <div className={[
                  'rounded border px-2 py-1',
                  canCommit ? 'border-green-500/40 text-vscode-text' : 'border-vscode-border text-vscode-text-muted',
                ].join(' ')}>
                  <div className="font-medium">3. Commit</div>
                  <div>{canCommit ? 'ready' : 'blocked'}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-1">
              <button
                onClick={handleGenerateCommitMessage}
                disabled={!canGenerateCommitMsg}
                className="text-[11px] px-2.5 py-1 rounded border border-vscode-border
                           text-vscode-text-muted hover:text-vscode-text hover:bg-vscode-sidebar-hover
                           cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'transparent', outline: 'none' }}
              >
                Generate commit message
              </button>
            </div>
            <textarea
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Commit message…"
              rows={3}
              className="w-full rounded text-sm px-2 py-1.5 resize-none
                         bg-vscode-bg border border-vscode-border
                         text-vscode-text placeholder-vscode-text-muted
                         focus:outline-none focus:border-vscode-accent"
            />
            <button
              onClick={handleCommit}
              disabled={!canCommit || busy}
              className={[
                'mt-2 w-full py-2 rounded text-sm font-medium transition-colors',
                canCommit && !busy
                  ? 'bg-vscode-accent text-white cursor-pointer'
                  : 'bg-vscode-sidebar border border-vscode-border text-vscode-text-muted opacity-50 cursor-not-allowed',
              ].join(' ')}
              style={{ border: 'none', outline: 'none' }}
            >
              {busy ? 'Working…' : 'Commit'}
            </button>
            <p className="mt-1.5 text-[11px] text-vscode-text-muted">
              Commit saves locally. Push uploads your commits to remote.
            </p>
          </div>
        )}

        {/* Push / Pull */}
        <div className="flex gap-2 px-3 pt-2 pb-3">
          <button
            onClick={handlePull}
            disabled={busy}
            className="flex-1 py-2 rounded text-sm border border-vscode-border
                       text-vscode-text hover:bg-vscode-sidebar-hover
                       cursor-pointer transition-colors disabled:opacity-40"
            style={{ background: 'transparent', outline: 'none' }}
          >
            Pull
          </button>
          <button
            onClick={handlePush}
            disabled={busy}
            className="flex-1 py-2 rounded text-sm border border-vscode-border
                       text-vscode-text hover:bg-vscode-sidebar-hover
                       cursor-pointer transition-colors disabled:opacity-40"
            style={{ background: 'transparent', outline: 'none' }}
          >
            Push
          </button>
        </div>

        {actionMsg && (
          <p className="px-3 pb-3 text-[11px] text-vscode-text-muted whitespace-pre-wrap break-words">
            {actionMsg}
          </p>
        )}
      </div>
    </div>
  );
}

const SUB_TABS = [
  { id: 'file-explorer', label: 'Files' },
  { id: 'source-control', label: 'Git' },
];

export default function WorkspaceView({ onOpenFile }) {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    const stored = readText(EXTENSIONS_TAB_KEY, 'file-explorer');
    return SUB_TABS.some((tab) => tab.id === stored) ? stored : 'file-explorer';
  });
  const [fileTree, setFileTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    writeText(EXTENSIONS_TAB_KEY, activeSubTab);
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab !== 'file-explorer') return;
    setLoading(true);
    setError(null);
    fetch(apiUrl('/api/files'))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => setFileTree(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeSubTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab bar */}
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
              style={{ background: 'transparent', border: 'none', outline: 'none' }}
              className={[
                'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
                'min-h-[44px]',
                isActive
                  ? 'text-white border-b-2 border-vscode-accent'
                  : 'text-vscode-text-muted hover:text-vscode-text',
              ].join(' ')}
              aria-current={isActive ? 'true' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'file-explorer' && (
          <>
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-vscode-text-muted">
                Workspace
              </span>
              <button
                onClick={() => {
                  setFileTree(null);
                  setLoading(true);
                  fetch(apiUrl('/api/files'))
                    .then((r) => r.json())
                    .then(setFileTree)
                    .catch((e) => setError(e.message))
                    .finally(() => setLoading(false));
                }}
                title="Refresh"
                style={{ background: 'none', border: 'none', outline: 'none' }}
                className="text-vscode-text-muted hover:text-vscode-text cursor-pointer p-1"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 px-3 py-4 text-vscode-text-muted text-sm">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.22-8.56" strokeLinecap="round" />
                </svg>
                Loading…
              </div>
            )}

            {error && (
              <p className="px-3 py-4 text-sm text-red-400">
                Error: {error}
              </p>
            )}

            {!loading && !error && fileTree && (
              <FileNode node={fileTree} depth={0} onOpenFile={onOpenFile} />
            )}
          </>
        )}

        {activeSubTab === 'source-control' && <GitView />}
      </div>
    </div>
  );
}
