import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Shield, User, LogOut, LogIn, Sparkles, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Navbar({ activePage, setActivePage, onOpenSubmit }) {
  const { user, isAuthenticated, isAdmin, isContributor, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      api.getPendingComponents()
        .then(res => setPendingCount(res.count || 0))
        .catch(() => {});
    }
  }, [isAdmin, activePage]);

  return (
    <header className="sticky top-0 z-40 bg-paper-surface border-b border-paper-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActivePage('catalog')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-paper-accent text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-paper-accentHover transition-colors">
              <Layers size={20} />
            </div>
            <div>
              <span className="text-base font-bold text-paper-text tracking-tight font-mono block leading-none">
                CBSE Catalog
              </span>
              <span className="text-[10px] text-paper-muted uppercase tracking-widest font-mono">
                Component Registry
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActivePage('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePage === 'catalog'
                  ? 'bg-paper-accentTint text-paper-accent'
                  : 'text-paper-muted hover:text-paper-text hover:bg-paper-bg'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Browse Catalog</span>
            </button>

            {isContributor && (
              <button
                type="button"
                onClick={() => setActivePage('my-components')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activePage === 'my-components'
                    ? 'bg-paper-accentTint text-paper-accent'
                    : 'text-paper-muted hover:text-paper-text hover:bg-paper-bg'
                }`}
              >
                <Layers size={14} />
                <span>My Components</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActivePage('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors relative ${
                  activePage === 'admin'
                    ? 'bg-paper-accentTint text-paper-accent'
                    : 'text-paper-muted hover:text-paper-text hover:bg-paper-bg'
                }`}
              >
                <Shield size={14} />
                <span>Admin Moderation</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#B7791F] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Submit Component CTA (Contributors / Admins) */}
          {isContributor && (
            <button
              type="button"
              onClick={() => setActivePage('submit')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-paper-accent hover:bg-paper-accentHover text-white shadow-xs transition-colors"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Submit Component</span>
            </button>
          )}

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-paper-border">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-paper-text leading-tight">{user.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-paper-bg text-paper-accent font-semibold border border-paper-border">
                  {user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-paper-muted hover:text-paper-text hover:bg-paper-bg rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage('login')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-paper-text hover:bg-paper-bg border border-paper-border transition-colors"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePage('register')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-accent text-white hover:bg-paper-accentHover transition-colors"
              >
                <User size={13} />
                <span>Join</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
