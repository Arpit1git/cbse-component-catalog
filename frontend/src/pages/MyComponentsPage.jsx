import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Eye, Download, Star, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function MyComponentsPage({ onSelectComponent, onOpenSubmit }) {
  const { user } = useAuth();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyComponents = async () => {
    try {
      const res = await api.getMyComponents();
      setComponents(res.components || []);
    } catch (err) {
      console.error('Failed to load my components:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComponents();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete component "${name}"? This action cannot be undone.`)) {
      try {
        await api.deleteComponent(id);
        fetchMyComponents();
      } catch (err) {
        alert('Failed to delete component: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-paper-text font-mono">
            My Published Components
          </h1>
          <p className="text-xs text-paper-muted mt-1">
            Manage your registered CBSE UI modules, release updates, and track downloads.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSubmit}
          className="flex items-center gap-1.5 px-4 py-2 bg-paper-accent hover:bg-paper-accentHover text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>New Component</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-paper-surface border border-paper-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : components.length === 0 ? (
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-12 text-center">
          <Layers size={36} className="mx-auto text-paper-muted/50 mb-3" />
          <h3 className="text-base font-bold text-paper-text font-mono">No components published yet</h3>
          <p className="text-xs text-paper-muted mt-1 max-w-sm mx-auto">
            You haven't submitted any UI components to the catalog yet. Click below to register your first component!
          </p>
          <button
            type="button"
            onClick={onOpenSubmit}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-paper-accent text-white hover:bg-paper-accentHover"
          >
            Publish First Component
          </button>
        </div>
      ) : (
        <div className="bg-paper-surface border border-paper-border rounded-2xl overflow-hidden shadow-xs divide-y divide-paper-border">
          {components.map((c) => (
            <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper-bg/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectComponent(c.id)}
                    className="text-base font-bold text-paper-text font-mono hover:text-paper-accent text-left transition-colors"
                  >
                    {c.name}
                  </button>
                  <StatusBadge status={c.status} size="xs" />
                  <span className="text-xs px-2 py-0.5 rounded bg-paper-bg border border-paper-border text-paper-muted font-medium">
                    {c.framework}
                  </span>
                </div>
                <p className="text-xs text-paper-muted line-clamp-1">
                  {c.summary}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-paper-muted pt-1">
                  <span>Versions: <strong>{c.total_versions}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {c.view_count} views</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Download size={11} /> {c.download_count} downloads</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Star size={11} className="fill-[#B7791F] text-[#B7791F]" /> {c.avg_rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectComponent(c.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-surface border border-paper-border text-paper-text hover:bg-paper-bg transition-colors"
                >
                  <span>Manage</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  title="Delete Component"
                  className="p-1.5 rounded-lg text-paper-muted hover:text-[#B3402F] hover:bg-[#B3402F]/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
