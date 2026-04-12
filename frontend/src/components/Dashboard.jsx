import React, { useEffect, useState, useMemo } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import TaskStatsChart from './TaskStatsChart';
import * as taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';

// ── Skeleton loader for a task row ──────────────────────────
const TaskSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-clarity-border bg-clarity-card">
    <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3.5 rounded w-3/5" />
      <div className="skeleton h-2.5 rounded w-1/4" />
    </div>
  </div>
);

// ── Empty state ──────────────────────────────────────────────
const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 rounded-xl border border-dashed border-clarity-border text-center">
    <div className="w-10 h-10 rounded-full bg-clarity-surface flex items-center justify-center mb-3" aria-hidden="true">
      {icon}
    </div>
    <p className="text-sm font-medium text-clarity-subtext">{title}</p>
    {subtitle && <p className="text-xs text-clarity-muted mt-1">{subtitle}</p>}
  </div>
);

// ── Section header ───────────────────────────────────────────
const SectionHeader = ({ dot, label, count, dimmed = false }) => (
  <div className={`flex items-center gap-2.5 mb-3 ${dimmed ? 'opacity-60' : ''}`}>
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} aria-hidden="true" />
    <h2 className={`text-xs font-bold uppercase tracking-widest ${dimmed ? 'text-clarity-muted' : 'text-clarity-subtext'}`}>
      {label}
    </h2>
    {count !== undefined && (
      <span className="ml-auto text-xs font-medium text-clarity-muted bg-clarity-surface px-2 py-0.5 rounded-md border border-clarity-border">
        {count}
      </span>
    )}
  </div>
);

// ── Main Component ───────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doneLimit, setDoneLimit] = useState(20);
  const [showChart, setShowChart] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAddTask = async (taskData) => {
    setError(null);
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Error adding task', err);
      setError('Failed to add task.');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: newStatus, completed_at: newStatus === 'DONE' ? new Date().toISOString() : null }
        : t
    ));
    try {
      await taskService.toggleTaskStatus(id, newStatus);
    } catch (err) {
      console.error('Error updating status', err);
      setError('Failed to update task status.');
      fetchTasks(); // revert on error
    }
  };

  const handleDeleteTask = async (id) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await taskService.deleteTask(id);
    } catch (err) {
      console.error('Error deleting task', err);
      setError('Failed to delete task.');
      fetchTasks(); // revert on error
    }
  };

  const { progressPercent, todayTasks, upcomingTasks, doneTasks } = useMemo(() => {
    const doneCount = tasks.filter(t => t.status === 'DONE').length;
    const totalCount = tasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

    const todayDateStr = new Date().toLocaleDateString('en-CA');
    const priorityWeight = { HIGH: 1, MEDIUM: 2, LOW: 3 };

    const pendingTasks = tasks
      .filter(t => t.status === 'PENDING')
      .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

    const doneList = tasks
      .filter(t => t.status === 'DONE')
      .sort((a, b) =>
        new Date(b.completed_at || b.updated_at || b.created_at || 0) -
        new Date(a.completed_at || a.updated_at || a.created_at || 0)
      );

    const todayList = [];
    const upcomingList = [];
    pendingTasks.forEach(t => {
      if (!t.deadline) {
        todayList.push(t);
      } else {
        const taskDate = t.deadline.includes('T') ? t.deadline.split('T')[0] : t.deadline.substring(0, 10);
        if (taskDate <= todayDateStr) todayList.push(t);
        else upcomingList.push(t);
      }
    });

    return { progressPercent: progress, todayTasks: todayList, upcomingTasks: upcomingList, doneTasks: doneList };
  }, [tasks]);

  const username = user?.username || 'there';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-dvh bg-clarity-bg">
      {/* ── Top nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-clarity-bg/80 backdrop-blur-md border-b border-clarity-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-clarity-accent flex items-center justify-center shadow-glow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-clarity-text tracking-tight">Clarity</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Chart toggle */}
            <button
              id="toggle-chart-btn"
              onClick={() => setShowChart(p => !p)}
              aria-pressed={showChart}
              aria-label="Toggle activity chart"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                showChart
                  ? 'bg-clarity-accent/10 border-clarity-accent/30 text-clarity-accent-light'
                  : 'bg-clarity-surface border-clarity-border text-clarity-subtext hover:text-clarity-text'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Activity
            </button>

            {/* User pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-clarity-surface border border-clarity-border rounded-lg">
              <div className="w-5 h-5 rounded-full bg-clarity-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-clarity-accent-light uppercase">
                  {username.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-medium text-clarity-subtext hidden sm:block">{username}</span>
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={logout}
              aria-label="Sign out"
              className="p-2 rounded-lg text-clarity-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <header className="mb-8 animate-fade-in">
          <p className="text-sm text-clarity-muted mb-1">{greeting}, <span className="text-clarity-subtext font-medium">{username}</span></p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl font-bold text-clarity-text tracking-tight">
              {todayTasks.length === 0 && !loading
                ? "You're all clear today ✓"
                : `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} need${todayTasks.length === 1 ? 's' : ''} your focus`}
            </h1>

            {/* Progress pill */}
            {tasks.length > 0 && (
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-clarity-subtext">{progressPercent}% done</span>
                <div className="w-24 h-1.5 bg-clarity-border rounded-full overflow-hidden">
                  <div
                    className="progress-bar h-full"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progressPercent}% of tasks completed`}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Error banner ── */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Task Form ── */}
        <div className="mb-8 animate-fade-in">
          <TaskForm onTaskAdded={handleAddTask} />
        </div>

        {/* ── Activity Chart (collapsible) ── */}
        {showChart && (
          <div className="mb-8 animate-scale-in">
            <TaskStatsChart />
          </div>
        )}

        {/* ── Task sections ── */}
        {loading ? (
          <div className="space-y-10" aria-busy="true" aria-label="Loading tasks">
            {/* Today skeleton */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="skeleton w-2 h-2 rounded-full" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => <TaskSkeleton key={i} />)}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="skeleton w-2 h-2 rounded-full" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="space-y-2">
                {[1, 2].map(i => <TaskSkeleton key={i} />)}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── TODAY'S FOCUS ── */}
            <section aria-labelledby="section-today">
              <SectionHeader
                id="section-today"
                dot="bg-clarity-accent"
                label="Today's Focus"
                count={todayTasks.length}
              />
              {todayTasks.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-5 h-5 text-clarity-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  title="You're clear for today"
                  subtitle="Add a task above or enjoy your focus time."
                />
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task, i) => (
                    <div key={task.id} className="animate-slide-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <TaskItem task={task} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── UPCOMING ── */}
            {upcomingTasks.length > 0 && (
              <section aria-labelledby="section-upcoming">
                <SectionHeader
                  id="section-upcoming"
                  dot="bg-blue-400"
                  label="Upcoming"
                  count={upcomingTasks.length}
                  dimmed
                />
                <div className="space-y-2 opacity-70">
                  {upcomingTasks.map((task, i) => (
                    <div key={task.id} className="animate-slide-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <TaskItem task={task} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── DONE ── */}
            {doneTasks.length > 0 && (
              <section aria-labelledby="section-done" className="pt-4 border-t border-clarity-border">
                <SectionHeader
                  id="section-done"
                  dot="bg-clarity-muted"
                  label="Completed"
                  count={doneTasks.length}
                  dimmed
                />
                <div className="space-y-2">
                  {doneTasks.slice(0, doneLimit).map((task, i) => (
                    <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                      <TaskItem task={task} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} />
                    </div>
                  ))}
                </div>
                {doneTasks.length > doneLimit && (
                  <div className="text-center mt-4">
                    <button
                      id="load-more-btn"
                      onClick={() => setDoneLimit(prev => prev + 20)}
                      className="text-xs font-semibold text-clarity-muted hover:text-clarity-subtext px-4 py-2 rounded-lg border border-clarity-border hover:border-clarity-muted bg-clarity-surface transition-all duration-150"
                    >
                      Show {Math.min(20, doneTasks.length - doneLimit)} more completed tasks
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── Truly empty state ── */}
            {!loading && tasks.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-clarity-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-clarity-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-clarity-text mb-2">No tasks yet</h3>
                <p className="text-sm text-clarity-muted max-w-xs mx-auto">
                  Tap the input above and add your first task to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
