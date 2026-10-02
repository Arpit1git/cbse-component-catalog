import React, { useState, useEffect } from 'react';
import { Layers, Plus, Sparkles, Code, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LivePreviewFrame from '../components/LivePreviewFrame';

export default function SubmitComponentPage({ onNavigateCatalog, onComponentCreated }) {
  const { user, isContributor, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [framework, setFramework] = useState('HTML/CSS');
  const [license, setLicense] = useState('MIT');
  const [repoUrl, setRepoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('responsive, modern');
  
  // Version 1.0.0 Code
  const [versionNumber, setVersionNumber] = useState('1.0.0');
  const [releaseNotes, setReleaseNotes] = useState('Initial production release');
  const [htmlCode, setHtmlCode] = useState(`<div class="card">\n  <h3>Hello CBSE</h3>\n  <p>Modular UI component.</p>\n  <button id="btn">Click me</button>\n</div>`);
  const [cssCode, setCssCode] = useState(`.card { padding: 1.5rem; background: #FDFCF9; border: 1px solid #DDD8CB; border-radius: 8px; }\nbutton { margin-top: 0.75rem; padding: 0.5rem 1rem; background: #1F5E4B; color: #fff; border: none; border-radius: 4px; cursor: pointer; }`);
  const [jsCode, setJsCode] = useState(`document.getElementById('btn')?.addEventListener('click', () => {\n  alert('Component event fired!');\n});`);
  const [usageNotes, setUsageNotes] = useState('Embed HTML in your page and load the styling rules.');
  const [depName, setDepName] = useState('Vanilla JavaScript');
  const [depVersion, setDepVersion] = useState('ES6+');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewTab, setPreviewTab] = useState(true);

  useEffect(() => {
    api.getCategories().then(res => {
      setCategories(res.categories || []);
      if (res.categories?.length > 0) setCategoryId(res.categories[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const depsArray = [];
      if (depName.trim() && depVersion.trim()) {
        depsArray.push({ library_name: depName.trim(), library_version: depVersion.trim() });
      }

      const payload = {
        name,
        summary,
        category_id: Number(categoryId),
        framework,
        license,
        repo_url: repoUrl,
        tags: tagsArray,
        version_number: versionNumber,
        release_notes: releaseNotes,
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        usage_notes: usageNotes,
        dependencies: depsArray,
      };

      const res = await api.createComponent(payload);
      alert(res.message || 'Component submitted successfully!');
      if (onComponentCreated) {
        onComponentCreated(res.component_id);
      } else {
        onNavigateCatalog();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit component.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isContributor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-mono text-paper-text">Contributor Access Required</h2>
        <p className="text-xs text-paper-muted mt-2">
          Only registered contributors and administrators can publish or submit components to the catalog.
        </p>
        <button
          type="button"
          onClick={onNavigateCatalog}
          className="mt-4 px-4 py-2 bg-paper-accent text-white rounded-lg text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        type="button"
        onClick={onNavigateCatalog}
        className="inline-flex items-center gap-2 text-xs font-semibold text-paper-muted hover:text-paper-text mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Catalog</span>
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-paper-accentTint text-paper-accent text-xs font-semibold mb-2">
          <Sparkles size={12} />
          <span>Publish to CBSE Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-paper-text font-mono">
          Register New UI Component
        </h1>
        <p className="text-xs text-paper-muted mt-1 max-w-2xl">
          {isAdmin 
            ? 'As an Admin, your component will be immediately approved and published.' 
            : 'Submitted components will be queued for Admin moderation before appearing publicly.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metadata & Code Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Component Metadata */}
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
              1. Component Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                Component Name * (e.g. hero-banner, auth-modal)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="avatar-group"
                className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs font-mono text-paper-text focus:ring-2 focus:ring-paper-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                Summary / Description *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A cluster of stacked user avatar circles with overflow badge and hover animation."
                className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:ring-2 focus:ring-paper-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:ring-2 focus:ring-paper-accent"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  Framework *
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text focus:ring-2 focus:ring-paper-accent"
                >
                  <option value="HTML/CSS">HTML/CSS</option>
                  <option value="Tailwind CSS">Tailwind CSS</option>
                  <option value="Bootstrap">Bootstrap</option>
                  <option value="React">React</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  License
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text"
                >
                  <option value="MIT">MIT License</option>
                  <option value="Apache 2.0">Apache 2.0</option>
                  <option value="BSD-3-Clause">BSD-3-Clause</option>
                  <option value="ISC">ISC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="responsive, dark-mode, minimal"
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                Source Repository Link (Optional)
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/myorg/my-component"
                className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text"
              />
            </div>
          </div>

          {/* 2. Initial Version & Code */}
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
              2. Initial Version (v{versionNumber}) Code
            </h3>

            <div>
              <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                HTML Code *
              </label>
              <textarea
                rows={6}
                required
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  CSS Code (Optional)
                </label>
                <textarea
                  rows={5}
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  JavaScript Code (Optional)
                </label>
                <textarea
                  rows={5}
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full px-3 py-2 bg-paper-codeBg text-paper-codeText rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                How to Use / Props Instructions
              </label>
              <input
                type="text"
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                placeholder="Include Tailwind CDN or embed HTML markup."
                className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs text-paper-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  Primary Dependency
                </label>
                <input
                  type="text"
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  placeholder="Tailwind CSS"
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-paper-muted uppercase mb-1">
                  Dependency Version
                </label>
                <input
                  type="text"
                  value={depVersion}
                  onChange={(e) => setDepVersion(e.target.value)}
                  placeholder="3.4"
                  className="w-full px-3 py-2 bg-paper-bg border border-paper-border rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-paper-accent hover:bg-paper-accentHover text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            {submitting ? 'Registering Component...' : 'Submit Component to Catalog'}
          </button>
        </div>

        {/* Right Column: Live Authoring Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono flex items-center gap-1.5">
                <Eye size={13} />
                <span>Live Authoring Preview</span>
              </h3>
            </div>

            <LivePreviewFrame
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
              framework={framework}
              minHeight="420px"
            />

            <div className="mt-4 p-4 rounded-xl bg-paper-surface border border-paper-border text-xs text-paper-muted space-y-1">
              <p className="font-semibold text-paper-text">Preview Verification Rule:</p>
              <p>Verify that your HTML layout renders and interactive scripts execute cleanly before submitting.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
