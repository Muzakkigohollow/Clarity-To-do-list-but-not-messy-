import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-clarity-bg">
      {/* ── Left panel: brand ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col items-start justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #18181b 0%, #0f0f11 60%, #140d22 100%)' }}>
        {/* Decorative orb */}
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-12 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-clarity-accent flex items-center justify-center shadow-glow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-clarity-text tracking-tight">Clarity</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-clarity-text leading-tight tracking-tight mb-4">
            Clear your mind.<br />
            <span className="text-clarity-accent-light">Focus on today.</span>
          </h2>
          <p className="text-clarity-subtext text-base leading-relaxed max-w-xs">
            Everything you need to stay organised, nothing you don't.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-3">
          {[
            'Smart daily focus view',
            'Auto-sorted by priority',
            'Completion trend analytics',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm text-clarity-subtext">
              <div className="w-5 h-5 rounded-full bg-clarity-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-clarity-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-clarity-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-clarity-text">Clarity</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-clarity-text tracking-tight">Welcome back</h1>
            <p className="text-clarity-subtext text-sm mt-1">Sign in to your workspace</p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-clarity-subtext uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                className="w-full px-4 py-3 bg-clarity-surface border border-clarity-border rounded-xl text-clarity-text text-sm placeholder-clarity-muted transition-all focus:outline-none focus:border-clarity-accent focus:ring-2 focus:ring-clarity-accent/20"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-clarity-subtext uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 bg-clarity-surface border border-clarity-border rounded-xl text-clarity-text text-sm placeholder-clarity-muted transition-all focus:outline-none focus:border-clarity-accent focus:ring-2 focus:ring-clarity-accent/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-clarity-muted hover:text-clarity-subtext transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-clarity-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? '#6d28d9' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-clarity-muted">
            New here?{' '}
            <Link to="/register" className="font-semibold text-clarity-accent-light hover:text-white transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
