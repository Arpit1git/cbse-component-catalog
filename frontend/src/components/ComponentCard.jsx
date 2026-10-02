import React from 'react';
import { Eye, Download, Play, Layers } from 'lucide-react';
import StarRating from './StarRating';
import StatusBadge from './StatusBadge';

export default function ComponentCard({ component, onSelect, onQuickPreview }) {
  return (
    <div className="group flex flex-col justify-between rounded-xl border border-paper-border bg-paper-surface hover:border-paper-accent/60 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card Header & Metadata */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onSelect(component.id)}
              className="text-base font-bold text-paper-text font-mono hover:text-paper-accent text-left truncate block transition-colors"
            >
              {component.name}
            </button>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-paper-muted">by {component.owner_name}</span>
              <span className="text-[10px] text-paper-muted">•</span>
              <span className="text-xs font-mono text-paper-muted">v{component.latest_version || '1.0.0'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={component.status} size="xs" />
            {component.latest_version_status === 'deprecated' && (
              <StatusBadge status="deprecated" size="xs" />
            )}
          </div>
        </div>

        {/* Description Summary */}
        <p className="text-xs text-paper-muted line-clamp-2 mb-4 leading-relaxed">
          {component.summary}
        </p>

        {/* Category, Framework, and Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-paper-accentTint text-paper-accent font-medium">
            {component.framework}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-paper-bg border border-paper-border text-paper-text font-medium">
            {component.category_name}
          </span>
          {component.tags?.slice(0, 2).map((t) => (
            <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-paper-bg text-paper-muted border border-paper-border">
              #{t.name}
            </span>
          ))}
          {component.tags?.length > 2 && (
            <span className="text-[10px] text-paper-muted">+{component.tags.length - 2}</span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-paper-bg/40 border-t border-paper-border flex items-center justify-between text-xs">
        {/* Rating and Counts */}
        <div className="flex items-center gap-3">
          <StarRating rating={component.avg_rating} totalReviews={component.review_count} size={13} />

          <div className="flex items-center gap-2 text-paper-muted text-[11px]">
            <span className="flex items-center gap-0.5" title={`${component.view_count} views`}>
              <Eye size={12} /> {component.view_count}
            </span>
            <span className="flex items-center gap-0.5" title={`${component.download_count} downloads`}>
              <Download size={12} /> {component.download_count}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onQuickPreview(component)}
            title="Quick Live Preview"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-paper-accentTint text-paper-accent hover:bg-paper-accent hover:text-white transition-colors"
          >
            <Play size={11} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(component.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-paper-surface border border-paper-border text-paper-text hover:bg-paper-bg transition-colors"
          >
            <Layers size={11} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
