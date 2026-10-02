import React, { useState } from 'react';
import { LogIn, Key, Mail, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(user.role);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper-surface border border-paper-border rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-paper-accentTint text-paper-accent rounded-xl flex items-center justify-center mx-auto mb-3 font-mono font-bold text-xl">
            🏛️
          </div>
          <h2 className="text-2xl font-bold font-mono text-paper-text">Sign In to Catalog</h2>
          <p className="text-xs text-paper-muted mt-1">
            Access components, manage releases, and review CBSE modules
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-paper-muted mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-paper-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-9 pr-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-paper-muted mb-1">
              Password
            </label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-paper-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-paper-accent hover:bg-paper-accentHover text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick Login */}
        <div className="mt-6 pt-5 border-t border-paper-border">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-paper-muted text-center mb-2 font-mono">
            ⚡ Instant Demo Login
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@catalog.dev', 'admin123')}
              className="px-2 py-1.5 rounded-lg border border-paper-border bg-paper-bg hover:bg-paper-accentTint hover:border-paper-accent text-paper-text text-[11px] font-semibold transition-colors flex flex-col items-center"
            >
              <Shield size={12} className="text-paper-accent mb-0.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@dev.com', 'sarah123')}
              className="px-2 py-1.5 rounded-lg border border-paper-border bg-paper-bg hover:bg-paper-accentTint hover:border-paper-accent text-paper-text text-[11px] font-semibold transition-colors flex flex-col items-center"
            >
              <User size={12} className="text-paper-accent mb-0.5" />
              <span>Contributor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('john@consumer.dev', 'john123')}
              className="px-2 py-1.5 rounded-lg border border-paper-border bg-paper-bg hover:bg-paper-accentTint hover:border-paper-accent text-paper-text text-[11px] font-semibold transition-colors flex flex-col items-center"
            >
              <User size={12} className="text-paper-muted mb-0.5" />
              <span>Consumer</span>
            </button>
          </div>
        </div>

        {/* Register Navigation */}
        <div className="mt-6 text-center text-xs text-paper-muted">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-paper-accent font-semibold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
