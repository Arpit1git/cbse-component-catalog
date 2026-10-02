import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, Eye, Users, BarChart3, Clock, AlertCircle, 
  Download, MessageSquare, Layers, Sparkles 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LivePreviewFrame from '../components/LivePreviewFrame';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboardPage({ onSelectComponent }) {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'analytics' | 'users'
  
  // Moderation state
  const [pendingList, setPendingList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Analytics state
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const res = await api.getPendingComponents();
      setPendingList(res.pending || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getAdminStats();
      setStatsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getUsers();
      setUsersList(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation') fetchPending();
    if (activeTab === 'analytics') fetchStats();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleModeration = async (id, status) => {
    try {
      await api.setComponentStatus(id, status);
      fetchPending();
    } catch (err) {
      alert(`Failed to mark component as ${status}: ` + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-mono text-paper-text">Administrator Access Required</h2>
        <p className="text-xs text-paper-muted mt-2">
          You must be logged in with an Administrator account to access governance tools and moderation queues.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 bg-paper-surface border border-paper-border rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-paper-accentTint text-paper-accent text-xs font-semibold mb-2">
              <Shield size={13} />
              <span>Governance & Quality Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-paper-text font-mono">
              Admin Moderation Dashboard
            </h1>
            <p className="text-xs text-paper-muted mt-1">
              Enforce metadata standards, verify live component functionality, and manage user roles.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-paper-bg border border-paper-border rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('moderation')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'moderation'
                  ? 'bg-paper-accent text-white shadow-xs'
                  : 'text-paper-muted hover:text-paper-text'
              }`}
            >
              <Clock size={13} />
              <span>Moderation Queue ({pendingList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-paper-accent text-white shadow-xs'
                  : 'text-paper-muted hover:text-paper-text'
              }`}
            >
              <BarChart3 size={13} />
              <span>Catalog Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-paper-accent text-white shadow-xs'
                  : 'text-paper-muted hover:text-paper-text'
              }`}
            >
              <Users size={13} />
              <span>User Roles</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div>
          {loadingPending ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-64 bg-paper-surface border border-paper-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : pendingList.length === 0 ? (
            <div className="bg-paper-surface border border-paper-border rounded-2xl p-12 text-center">
              <Check size={40} className="mx-auto text-[#2F7D4F] mb-3" />
              <h3 className="text-base font-bold text-paper-text font-mono">Moderation Queue is Clear!</h3>
              <p className="text-xs text-paper-muted mt-1">
                All submitted UI components have been reviewed and approved.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {pendingList.map((item) => (
                <div
                  key={item.id}
                  className="bg-paper-surface border-2 border-[#B7791F]/40 rounded-2xl p-6 sm:p-8 shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-paper-border">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold font-mono text-paper-text">
                          🧩 {item.name}
                        </h3>
                        <StatusBadge status="pending" size="sm" />
                        <span className="text-xs px-2.5 py-0.5 rounded bg-paper-accentTint text-paper-accent font-semibold">
                          {item.framework}
                        </span>
                        <span className="text-xs font-mono text-paper-muted">
                          v{item.version_number || '1.0.0'}
                        </span>
                      </div>

                      <p className="text-xs text-paper-text leading-relaxed max-w-2xl">
                        {item.summary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-paper-muted pt-1">
                        <span>Submitted by: <strong className="text-paper-text">{item.owner_name}</strong> ({item.owner_email})</span>
                        <span>•</span>
                        <span>Category: <strong>{item.category_name}</strong></span>
                        <span>•</span>
                        <span>License: <strong>{item.license}</strong></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleModeration(item.id, 'rejected')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#B3402F]/40 bg-[#B3402F]/10 text-[#B3402F] hover:bg-[#B3402F] hover:text-white transition-colors"
                      >
                        <X size={14} />
                        <span>Reject Submission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModeration(item.id, 'approved')}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#2F7D4F] hover:bg-[#25663F] text-white shadow-sm transition-colors"
                      >
                        <Check size={14} />
                        <span>Approve & Publish</span>
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Live Preview Verification */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono mb-2 flex items-center gap-1.5">
                      <Eye size={13} />
                      <span>Live Sandboxed Functionality Test</span>
                    </h4>
                    <LivePreviewFrame
                      htmlCode={item.html_code || ''}
                      cssCode={item.css_code || ''}
                      jsCode={item.js_code || ''}
                      framework={item.framework}
                      minHeight="280px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS & STATS */}
      {activeTab === 'analytics' && statsData && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-paper-surface border border-paper-border rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-paper-muted">Total Components</span>
              <div className="mt-2 text-2xl font-extrabold font-mono text-paper-text">
                {statsData.stats.totalComponents}
              </div>
              <div className="mt-1 text-[11px] text-[#2F7D4F] font-medium">
                {statsData.stats.approvedComponents} Approved • {statsData.stats.pendingComponents} Pending
              </div>
            </div>

            <div className="bg-paper-surface border border-paper-border rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-paper-muted">Total Downloads</span>
              <div className="mt-2 text-2xl font-extrabold font-mono text-paper-text">
                {statsData.stats.totalDownloads}
              </div>
              <div className="mt-1 text-[11px] text-paper-muted font-medium">
                Direct component package exports
              </div>
            </div>

            <div className="bg-paper-surface border border-paper-border rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-paper-muted">Total Views</span>
              <div className="mt-2 text-2xl font-extrabold font-mono text-paper-text">
                {statsData.stats.totalViews}
              </div>
              <div className="mt-1 text-[11px] text-paper-muted font-medium">
                Catalog page impressions
              </div>
            </div>

            <div className="bg-paper-surface border border-paper-border rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-paper-muted">Community Reviews</span>
              <div className="mt-2 text-2xl font-extrabold font-mono text-paper-text">
                {statsData.stats.totalReviews}
              </div>
              <div className="mt-1 text-[11px] text-paper-muted font-medium">
                From registered developers
              </div>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono mb-4">
                Components by Category
              </h3>
              <div className="space-y-3">
                {statsData.categoryBreakdown?.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <span className="text-paper-text font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-paper-bg h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-paper-accent h-full rounded-full"
                          style={{ width: `${Math.min(100, (cat.count / statsData.stats.totalComponents) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-paper-text w-6 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono mb-4">
                Components by Framework
              </h3>
              <div className="space-y-3">
                {statsData.frameworkBreakdown?.map((fw) => (
                  <div key={fw.framework} className="flex items-center justify-between text-xs">
                    <span className="text-paper-text font-medium">{fw.framework}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-paper-bg h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-paper-accent h-full rounded-full"
                          style={{ width: `${Math.min(100, (fw.count / statsData.stats.totalComponents) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-paper-text w-6 text-right">{fw.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-paper-surface border border-paper-border rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-bg border-b border-paper-border text-paper-muted uppercase font-mono">
              <tr>
                <th className="py-3.5 px-5">Name & Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5 text-center">Components Published</th>
                <th className="py-3.5 px-5 text-center">Reviews</th>
                <th className="py-3.5 px-5">Joined</th>
                <th className="py-3.5 px-5 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-paper-bg/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-paper-text">{u.name}</div>
                    <div className="text-paper-muted text-[11px] font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-paper-accent text-white'
                        : u.role === 'contributor'
                        ? 'bg-paper-accentTint text-paper-accent'
                        : 'bg-paper-bg text-paper-muted border border-paper-border'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-paper-text">
                    {u.component_count || 0}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-paper-text">
                    {u.review_count || 0}
                  </td>
                  <td className="py-3.5 px-5 text-paper-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <select
                      value={u.role}
                      disabled={u.id === user.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-paper-bg border border-paper-border rounded-lg text-xs font-medium text-paper-text focus:ring-1 focus:ring-paper-accent disabled:opacity-50"
                    >
                      <option value="consumer">consumer</option>
                      <option value="contributor">contributor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
