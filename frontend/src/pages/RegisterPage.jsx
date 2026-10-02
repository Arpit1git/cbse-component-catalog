import React, { useState } from 'react';
import { UserPlus, User, Mail, Key, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigateLogin, onRegisterSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer'); // 'consumer' | 'contributor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await register({ name, email, password, role });
      if (onRegisterSuccess) {
        onRegisterSuccess(user.role);
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper-surface border border-paper-border rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-paper-accentTint text-paper-accent rounded-xl flex items-center justify-center mx-auto mb-3 font-mono font-bold text-xl">
            ✨
          </div>
          <h2 className="text-2xl font-bold font-mono text-paper-text">Create Account</h2>
          <p className="text-xs text-paper-muted mt-1">
            Join the CBSE UI Component Registry
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F]">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-paper-muted mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-paper-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Chen"
                className="w-full pl-9 pr-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
              />
            </div>
          </div>

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
                placeholder="sarah@company.com"
                className="w-full pl-9 pr-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-paper-muted mb-1">
              Password (Min 6 chars)
            </label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-paper-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-paper-muted mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-3 rounded-lg border cursor-pointer text-xs flex flex-col justify-between transition-colors ${
                role === 'consumer'
                  ? 'border-paper-accent bg-paper-accentTint/50 text-paper-accent font-semibold'
                  : 'border-paper-border bg-paper-bg text-paper-muted'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="consumer"
                  checked={role === 'consumer'}
                  onChange={() => setRole('consumer')}
                  className="sr-only"
                />
                <span className="font-bold">Consumer</span>
                <span className="text-[10px] mt-1 opacity-80">Search, preview, download, and review</span>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer text-xs flex flex-col justify-between transition-colors ${
                role === 'contributor'
                  ? 'border-paper-accent bg-paper-accentTint/50 text-paper-accent font-semibold'
                  : 'border-paper-border bg-paper-bg text-paper-muted'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="contributor"
                  checked={role === 'contributor'}
                  onChange={() => setRole('contributor')}
                  className="sr-only"
                />
                <span className="font-bold">Contributor</span>
                <span className="text-[10px] mt-1 opacity-80">Publish components & release updates</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-paper-accent hover:bg-paper-accentHover text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        {/* Login Navigation */}
        <div className="mt-6 text-center text-xs text-paper-muted">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-paper-accent font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
