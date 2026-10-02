import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import LivePreviewFrame from './LivePreviewFrame';
import StatusBadge from './StatusBadge';

export default function LivePreviewModal({ component, onClose, onOpenDetail }) {
  if (!component) return null;

  const preview = component.preview_code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-text/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-paper-surface border border-paper-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-border bg-paper-bg/50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-paper-text font-mono">
              🧩 {component.name}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-paper-accentTint text-paper-accent font-medium">
              {component.framework}
            </span>
            <span className="text-xs font-mono text-paper-muted">
              v{preview?.version_number || component.latest_version || '1.0.0'}
            </span>
            <StatusBadge status={component.status} size="xs" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDetail(component.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-accent text-white hover:bg-paper-accentHover transition-colors"
            >
              <span>View Full Details & Code</span>
              <ExternalLink size={13} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-paper-muted hover:text-paper-text hover:bg-paper-bg rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Live Sandboxed Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-paper-bg/30">
          <p className="text-sm text-paper-muted mb-4">
            {component.summary}
          </p>

          <LivePreviewFrame
            htmlCode={preview?.html_code || ''}
            cssCode={preview?.css_code || ''}
            jsCode={preview?.js_code || ''}
            framework={component.framework}
            minHeight="380px"
          />
        </div>
      </div>
    </div>
  );
}
