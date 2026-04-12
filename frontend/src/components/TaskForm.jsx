import React, { useState, useRef, useEffect } from 'react';

const PRIORITY_OPTIONS = [
  { value: 'HIGH',   label: 'High',   dot: 'bg-clarity-high',   text: 'text-red-400' },
  { value: 'MEDIUM', label: 'Medium', dot: 'bg-clarity-medium', text: 'text-amber-400' },
  { value: 'LOW',    label: 'Low',    dot: 'bg-clarity-low',    text: 'text-green-400' },
];

const TaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onTaskAdded({ title: title.trim(), priority, deadline: deadline || null });
    setTitle('');
    setPriority('MEDIUM');
    setDeadline('');
    setIsSubmitting(false);
    setIsExpanded(false);
  };

  const handleInputFocus = () => setIsExpanded(true);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isExpanded
          ? 'border-clarity-accent/50 bg-clarity-card shadow-glow-sm'
          : 'border-clarity-border bg-clarity-surface hover:border-clarity-muted'
      }`}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* ── Primary input row ── */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Add icon / submit icon */}
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            aria-label="Add task"
            className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-150 cursor-pointer ${
              title.trim()
                ? 'border-clarity-accent bg-clarity-accent/10 hover:bg-clarity-accent hover:scale-105'
                : 'border-clarity-border bg-transparent cursor-default'
            }`}
          >
            {isSubmitting ? (
              <svg className="w-3.5 h-3.5 text-clarity-accent animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg
                className={`w-3.5 h-3.5 transition-colors ${title.trim() ? 'text-clarity-accent-light' : 'text-clarity-muted'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>

          <input
            ref={inputRef}
            id="task-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Add a task…"
            aria-label="New task title"
            className="flex-1 bg-transparent text-clarity-text text-sm font-medium placeholder-clarity-muted focus:outline-none"
          />

          {/* Quick priority dot (visible when collapsed) */}
          {!isExpanded && title && (
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedPriority.dot} opacity-60`} aria-hidden="true" />
          )}

          {/* Keyboard hint */}
          {isExpanded && (
            <span className="text-xs text-clarity-muted hidden sm:block select-none">↩ to add</span>
          )}
        </div>

        {/* ── Expanded controls ── */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 flex flex-wrap items-center gap-3 border-t border-clarity-border/50 animate-fade-in">
            {/* Priority selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-clarity-muted font-medium">Priority</span>
              <div className="flex gap-1" role="group" aria-label="Task priority">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={priority === opt.value}
                    aria-label={`${opt.label} priority`}
                    onClick={() => setPriority(opt.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                      priority === opt.value
                        ? `border-current bg-current/10 ${opt.text}`
                        : 'border-clarity-border text-clarity-muted hover:border-clarity-subtext hover:text-clarity-subtext'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priority === opt.value ? opt.dot : 'bg-clarity-muted'}`} aria-hidden="true" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-4 bg-clarity-border" aria-hidden="true" />

            {/* Date input */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-clarity-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                id="task-deadline-input"
                aria-label="Task deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent text-xs text-clarity-subtext focus:outline-none focus:text-clarity-text transition-colors cursor-pointer"
              />
            </div>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => { setIsExpanded(false); setTitle(''); setDeadline(''); setPriority('MEDIUM'); }}
              className="ml-auto text-xs text-clarity-muted hover:text-clarity-subtext transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
