import React, { useState } from 'react';

const PRIORITY_CONFIG = {
  HIGH: {
    dot:    'bg-red-500',
    badge:  'bg-red-500/10 text-red-400 border-red-500/20',
    label:  'High',
  },
  MEDIUM: {
    dot:    'bg-amber-400',
    badge:  'bg-amber-400/10 text-amber-400 border-amber-400/20',
    label:  'Medium',
  },
  LOW: {
    dot:    'bg-green-500',
    badge:  'bg-green-500/10 text-green-400 border-green-500/20',
    label:  'Low',
  },
};

const TaskItem = ({ task, onToggleStatus, onDelete }) => {
  const isDone = task.status === 'DONE';
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  // Parse deadline cleanly (avoid timezone shifts)
  let formattedDate = null;
  let isOverdue = false;
  if (task.deadline) {
    const [y, m, d] = task.deadline.substring(0, 10).split('-');
    const deadlineDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isOverdue = !isDone && deadlineDate < today;
    formattedDate = deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    await onToggleStatus(task.id, isDone ? 'PENDING' : 'DONE');
    setToggling(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    await onDelete(task.id);
    // Component unmounts on success; no need to reset
  };

  return (
    <div
      className={`group flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
        isDone
          ? 'bg-clarity-surface/40 border-clarity-border/50 opacity-50'
          : 'bg-clarity-card border-clarity-border hover:border-clarity-border/80 hover:bg-clarity-hover'
      } ${deleting ? 'opacity-30 pointer-events-none' : ''}`}
    >
      {/* ── Checkbox ── */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        aria-label={isDone ? 'Mark as pending' : 'Mark as complete'}
        aria-pressed={isDone}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-clarity-accent ${
          isDone
            ? 'bg-clarity-muted border-clarity-muted'
            : 'border-clarity-border hover:border-clarity-accent bg-transparent'
        }`}
      >
        {isDone && (
          <svg
            className="w-2.5 h-2.5 text-white animate-check-pop"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toggling && !isDone && (
          <svg className="w-2.5 h-2.5 text-clarity-muted animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
      </button>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-clarity-muted' : 'text-clarity-text'}`}>
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Priority badge */}
          {!isDone && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} aria-hidden="true" />
              {config.label}
            </span>
          )}

          {/* Deadline */}
          {formattedDate && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
              isOverdue ? 'text-red-400' : isDone ? 'text-clarity-muted' : 'text-clarity-subtext'
            }`}>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isOverdue ? `Overdue · ` : ''}{formattedDate}
            </span>
          )}
        </div>
      </div>

      {/* ── Delete button ── */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete task: ${task.title}`}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg text-clarity-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 self-start mt-0.5"
      >
        {deleting ? (
          <svg className="w-4 h-4 animate-spin text-clarity-muted" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default TaskItem;
