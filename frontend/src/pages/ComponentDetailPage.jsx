import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, ExternalLink, GitBranch, Calendar, ShieldCheck, 
  Eye, Star, MessageSquare, AlertTriangle, Plus, CheckCircle2, Copy, Layers, Clock 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LivePreviewFrame from '../components/LivePreviewFrame';
import CodeViewer from '../components/CodeViewer';
import StarRating from '../components/StarRating';
import StatusBadge from '../components/StatusBadge';

export default function ComponentDetailPage({ componentId, onBack, onNavigateSubmit }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [activeTab, setActiveTab] = useState('preview-code'); // 'preview-code' | 'dependencies' | 'versions' | 'reviews'

  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Add Version modal state
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [newVerNumber, setNewVerNumber] = useState('');
  const [newVerReleaseNotes, setNewVerReleaseNotes] = useState('');
  const [newVerHtml, setNewVerHtml] = useState('');
  const [newVerCss, setNewVerCss] = useState('');
  const [newVerJs, setNewVerJs] = useState('');
  const [newVerUsage, setNewVerUsage] = useState('');
  const [newVerDepName, setNewVerDepName] = useState('');
  const [newVerDepVer, setNewVerDepVer] = useState('');
  const [submittingVersion, setSubmittingVersion] = useState(false);
  const [versionError, setVersionError] = useState('');

  // Download state
  const [downloading, setDownloading] = useState(false);

  const fetchComponent = async () => {
    try {
      const data = await api.getComponent(componentId);
      setComponent(data);
      if (data.versions && data.versions.length > 0 && !selectedVersionId) {
        setSelectedVersionId(data.versions[0].id);
      }
    } catch (err) {
      console.error('Failed to load component details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponent();
  }, [componentId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-10 w-36 bg-paper-border/40 rounded-lg animate-pulse mb-6" />
        <div className="h-64 bg-paper-surface border border-paper-border rounded-2xl animate-pulse mb-8" />
        <div className="h-96 bg-paper-surface border border-paper-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!component) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-paper-text font-mono">Component Not Found</h2>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-paper-accent text-white"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isOwner = user && (component.owner_id === user.id || isAdmin);
  const currentVersion = component.versions?.find(v => v.id === selectedVersionId) || component.versions?.[0] || {};
  const hasUserReviewed = user && component.reviews?.some(r => r.user_id === user.id);

  // Handle Download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.downloadComponent(component.id, currentVersion.id);
      // Create a Blob and trigger browser download
      const blob = new Blob([res.content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || `${component.name}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count on UI
      setComponent(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));
    } catch (err) {
      alert('Failed to download component bundle: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Handle Deprecation Toggle
  const handleToggleDeprecation = async (versionId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'deprecated' : 'active';
    try {
      await api.updateVersionStatus(component.id, versionId, nextStatus);
      fetchComponent();
    } catch (err) {
      alert('Failed to update version status: ' + err.message);
    }
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.submitReview(component.id, { rating: userRating, comment: userComment });
      setReviewSuccess('Thank you! Your review and rating have been recorded.');
      setUserComment('');
      fetchComponent();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Add Version Submission
  const handleAddVersionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingVersion(true);
    setVersionError('');

    try {
      const deps = [];
      if (newVerDepName.trim() && newVerDepVer.trim()) {
        deps.push({ library_name: newVerDepName.trim(), library_version: newVerDepVer.trim() });
      }

      await api.addVersion(component.id, {
        version_number: newVerNumber,
        release_notes: newVerReleaseNotes,
        html_code: newVerHtml,
        css_code: newVerCss,
        js_code: newVerJs,
        usage_notes: newVerUsage,
        dependencies: deps,
      });

      setShowAddVersionModal(false);
      setNewVerNumber('');
      setNewVerReleaseNotes('');
      setNewVerHtml('');
      setNewVerCss('');
      setNewVerJs('');
      setNewVerUsage('');
      setNewVerDepName('');
      setNewVerDepVer('');
      fetchComponent();
    } catch (err) {
      setVersionError(err.message || 'Failed to publish new version.');
    } finally {
      setSubmittingVersion(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-paper-muted hover:text-paper-text mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Catalog</span>
      </button>

      {/* Component Hero Card */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-paper-text font-mono">
                {component.name}
              </h1>

              {/* Version Switcher Dropdown */}
              <div className="flex items-center gap-1 bg-paper-bg border border-paper-border rounded-lg px-2 py-1">
                <GitBranch size={13} className="text-paper-muted" />
                <select
                  value={selectedVersionId || ''}
                  onChange={(e) => setSelectedVersionId(Number(e.target.value))}
                  aria-label="Select component version"
                  className="bg-transparent text-xs font-mono font-semibold text-paper-text focus:outline-none cursor-pointer"
                >
                  {component.versions?.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} {v.status === 'deprecated' ? '(Deprecated)' : '(Active)'}
                    </option>
                  ))}
                </select>
              </div>

              <StatusBadge status={component.status} size="sm" />
              {currentVersion.status === 'deprecated' && (
                <StatusBadge status="deprecated" size="sm" />
              )}
            </div>

            <p className="text-sm text-paper-muted max-w-2xl leading-relaxed">
              {component.summary}
            </p>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-paper-muted">
              <span className="flex items-center gap-1 font-medium text-paper-text">
                <span className="w-2 h-2 rounded-full bg-paper-accent" />
                {component.framework}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-paper-bg border border-paper-border text-paper-text">
                Category: <strong>{component.category_name}</strong>
              </span>
              <span>•</span>
              <span>License: <strong>{component.license}</strong></span>
              <span>•</span>
              <span>Author: <strong>{component.owner_name}</strong></span>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 min-w-[200px]">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-paper-accent hover:bg-paper-accentHover text-white shadow-sm transition-all"
            >
              <Download size={14} />
              <span>{downloading ? 'Preparing Bundle...' : 'Download Component (.html)'}</span>
            </button>

            {component.repo_url && (
              <a
                href={component.repo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-paper-bg hover:bg-paper-border/50 text-paper-text border border-paper-border transition-colors"
              >
                <ExternalLink size={13} />
                <span>Source Repository</span>
              </a>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => setShowAddVersionModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-accentTint text-paper-accent hover:bg-paper-accent hover:text-white transition-colors"
              >
                <Plus size={13} />
                <span>Release New Version</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Bottom Bar: Stats and Signals */}
        <div className="mt-6 pt-5 border-t border-paper-border flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-5">
            <StarRating rating={component.avg_rating} totalReviews={component.review_count} size={15} />

            <span className="flex items-center gap-1 text-paper-muted">
              <Eye size={13} /> <strong>{component.view_count}</strong> views
            </span>

            <span className="flex items-center gap-1 text-paper-muted">
              <Download size={13} /> <strong>{component.download_count}</strong> downloads
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {component.tags?.map((t) => (
              <span key={t.id} className="text-[11px] px-2 py-0.5 rounded bg-paper-bg text-paper-muted border border-paper-border">
                #{t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Deprecated Warning Banner */}
      {currentVersion.status === 'deprecated' && (
        <div className="mb-6 p-4 rounded-xl border border-[#B7791F]/40 bg-[#B7791F]/10 flex items-center gap-3 text-xs text-[#B7791F]">
          <AlertTriangle size={18} className="shrink-0" />
          <div>
            <strong>Notice: Version {currentVersion.version_number} is marked as deprecated.</strong>
            <p className="mt-0.5 text-paper-text text-[11px]">A newer active version is recommended for new implementations.</p>
          </div>
        </div>
      )}

      {/* Main Tabbed Area */}
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-paper-border pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('preview-code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'preview-code'
                ? 'bg-paper-surface border-t-2 border-paper-accent text-paper-accent shadow-xs'
                : 'text-paper-muted hover:text-paper-text'
            }`}
          >
            <Layers size={14} />
            <span>Live Sandbox & Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dependencies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'dependencies'
                ? 'bg-paper-surface border-t-2 border-paper-accent text-paper-accent shadow-xs'
                : 'text-paper-muted hover:text-paper-text'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Dependencies ({currentVersion.dependencies?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'versions'
                ? 'bg-paper-surface border-t-2 border-paper-accent text-paper-accent shadow-xs'
                : 'text-paper-muted hover:text-paper-text'
            }`}
          >
            <Clock size={14} />
            <span>Version History ({component.versions?.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-paper-surface border-t-2 border-paper-accent text-paper-accent shadow-xs'
                : 'text-paper-muted hover:text-paper-text'
            }`}
          >
            <MessageSquare size={14} />
            <span>Reviews & Feedback ({component.reviews?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: Live Preview & Code */}
        {activeTab === 'preview-code' && (
          <div className="space-y-6">
            {/* Live Sandboxed Frame */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
                  1. Interactive Sandboxed Preview
                </h3>
              </div>
              <LivePreviewFrame
                htmlCode={currentVersion.html_code}
                cssCode={currentVersion.css_code}
                jsCode={currentVersion.js_code}
                framework={component.framework}
                minHeight="360px"
              />
            </div>

            {/* Code Snippets and Usage Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
                  2. Source Code & Integration
                </h3>
              </div>
              <CodeViewer
                htmlCode={currentVersion.html_code}
                cssCode={currentVersion.css_code}
                jsCode={currentVersion.js_code}
                usageNotes={currentVersion.usage_notes}
                framework={component.framework}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Dependencies */}
        {activeTab === 'dependencies' && (
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-paper-text font-mono mb-2">
              Component Dependencies for v{currentVersion.version_number}
            </h3>
            <p className="text-xs text-paper-muted mb-4">
              The external packages or runtime libraries required to execute this component correctly.
            </p>

            {currentVersion.dependencies && currentVersion.dependencies.length > 0 ? (
              <div className="divide-y divide-paper-border">
                {currentVersion.dependencies.map((dep) => (
                  <div key={dep.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-paper-accent" />
                      <span className="text-xs font-semibold text-paper-text font-mono">
                        {dep.library_name}
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-paper-bg border border-paper-border text-paper-muted">
                      Version: {dep.library_version}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-paper-muted bg-paper-bg rounded-xl">
                Zero external runtime dependencies. Self-contained component.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Version History */}
        {activeTab === 'versions' && (
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-paper-text font-mono">
                All Published Versions
              </h3>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowAddVersionModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-accent text-white"
                >
                  <Plus size={13} />
                  <span>Add Version</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {component.versions?.map((ver) => (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ver.id === selectedVersionId
                      ? 'border-paper-accent bg-paper-accentTint/20'
                      : 'border-paper-border bg-paper-bg/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-paper-text">
                        v{ver.version_number}
                      </span>
                      <StatusBadge status={ver.status} size="xs" />
                      <span className="text-xs text-paper-muted">
                        • Released {new Date(ver.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVersionId(ver.id)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-paper-surface border border-paper-border text-paper-text hover:bg-paper-bg"
                      >
                        {ver.id === selectedVersionId ? 'Currently Viewing' : 'View Code'}
                      </button>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleToggleDeprecation(ver.id, ver.status)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            ver.status === 'active'
                              ? 'border-[#B7791F]/40 text-[#B7791F] hover:bg-[#B7791F]/10'
                              : 'border-[#2F7D4F]/40 text-[#2F7D4F] hover:bg-[#2F7D4F]/10'
                          }`}
                        >
                          {ver.status === 'active' ? 'Mark Deprecated' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-paper-text leading-relaxed">
                    {ver.release_notes || 'No release notes.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-paper-text font-mono mb-4">
                  Community Feedback ({component.reviews?.length || 0})
                </h3>

                {component.reviews && component.reviews.length > 0 ? (
                  <div className="space-y-4 divide-y divide-paper-border">
                    {component.reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-paper-text">{rev.user_name}</span>
                          <span className="text-[11px] text-paper-muted">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-2">
                          <StarRating rating={rev.rating} size={13} />
                        </div>
                        <p className="text-xs text-paper-text leading-relaxed">
                          {rev.comment || 'No written commentary.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-paper-muted bg-paper-bg rounded-xl">
                    No reviews submitted yet. Be the first to review this component!
                  </div>
                )}
              </div>
            </div>

            {/* Submit Review Card */}
            <div className="lg:col-span-1">
              <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs sticky top-24">
                <h3 className="text-sm font-bold text-paper-text font-mono mb-2">
                  Rate & Review
                </h3>
                <p className="text-xs text-paper-muted mb-4">
                  Share your experience reusing this component in your project.
                </p>

                {isAuthenticated ? (
                  hasUserReviewed ? (
                    <div className="p-4 bg-paper-accentTint text-paper-accent rounded-xl text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>You have already reviewed this component.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {reviewError && (
                        <div className="p-2.5 rounded-lg bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F]">
                          {reviewError}
                        </div>
                      )}
                      {reviewSuccess && (
                        <div className="p-2.5 rounded-lg bg-[#2F7D4F]/10 border border-[#2F7D4F]/30 text-xs text-[#2F7D4F]">
                          {reviewSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-paper-muted uppercase mb-1.5">
                          Your Rating
                        </label>
                        <StarRating rating={userRating} editable={true} onChange={setUserRating} size={22} />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-paper-muted uppercase mb-1.5">
                          Comment (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="How easy was it to integrate? Any styling edge cases?"
                          className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-paper-accent"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full py-2 bg-paper-accent hover:bg-paper-accentHover text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="p-4 bg-paper-bg rounded-xl text-xs text-paper-muted text-center">
                    Please <strong className="text-paper-text">sign in</strong> to submit a rating and review.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Version Modal */}
      {showAddVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-text/60 backdrop-blur-sm">
          <div className="bg-paper-surface border border-paper-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-border bg-paper-bg/50">
              <h3 className="text-sm font-bold text-paper-text font-mono">
                Release New Version for {component.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVersionModal(false)}
                className="text-paper-muted hover:text-paper-text text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVersionSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {versionError && (
                <div className="p-3 rounded-lg bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F]">
                  {versionError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    Version Number * (e.g. 1.2.0)
                  </label>
                  <input
                    type="text"
                    required
                    value={newVerNumber}
                    onChange={(e) => setNewVerNumber(e.target.value)}
                    placeholder="1.1.0"
                    className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:ring-2 focus:ring-paper-accent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    Release Notes
                  </label>
                  <input
                    type="text"
                    value={newVerReleaseNotes}
                    onChange={(e) => setNewVerReleaseNotes(e.target.value)}
                    placeholder="Bug fixes and responsiveness improvements"
                    className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:ring-2 focus:ring-paper-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  HTML Code *
                </label>
                <textarea
                  rows={5}
                  required
                  value={newVerHtml}
                  onChange={(e) => setNewVerHtml(e.target.value)}
                  placeholder="<div class='...'>...</div>"
                  className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    CSS Code (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={newVerCss}
                    onChange={(e) => setNewVerCss(e.target.value)}
                    placeholder=".my-class { ... }"
                    className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    JS Code (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={newVerJs}
                    onChange={(e) => setNewVerJs(e.target.value)}
                    placeholder="document.getElementById(...)"
                    className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  How to Use / Props Notes
                </label>
                <input
                  type="text"
                  value={newVerUsage}
                  onChange={(e) => setNewVerUsage(e.target.value)}
                  placeholder="Include Tailwind CDN or link the compiled stylesheet."
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    Dependency Name
                  </label>
                  <input
                    type="text"
                    value={newVerDepName}
                    onChange={(e) => setNewVerDepName(e.target.value)}
                    placeholder="Bootstrap"
                    className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                    Dependency Version
                  </label>
                  <input
                    type="text"
                    value={newVerDepVer}
                    onChange={(e) => setNewVerDepVer(e.target.value)}
                    placeholder="5.3"
                    className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-paper-border">
                <button
                  type="button"
                  onClick={() => setShowAddVersionModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-paper-muted hover:bg-paper-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVersion}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-paper-accent hover:bg-paper-accentHover text-white"
                >
                  {submittingVersion ? 'Publishing...' : 'Publish Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
