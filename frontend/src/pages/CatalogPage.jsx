import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Layers, Star, Download, RotateCcw } from 'lucide-react';
import { api } from '../api/client';
import ComponentCard from '../components/ComponentCard';
import LivePreviewModal from '../components/LivePreviewModal';

export default function CatalogPage({ onSelectComponent, onOpenSubmit }) {
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');

  // Quick Preview Modal State
  const [previewComponent, setPreviewComponent] = useState(null);

  useEffect(() => {
    // Load categories
    api.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(err => console.error(err));
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const res = await api.getComponents({
        search,
        category: selectedCategory,
        framework: selectedFramework,
        minRating: minRating ? Number(minRating) : undefined,
        sort,
        status: 'approved',
      });
      setComponents(res.components || []);
    } catch (err) {
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComponents();
    }, 150);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedFramework, minRating, sort]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFramework('');
    setMinRating('');
    setSort('newest');
  };

  const frameworks = ['HTML/CSS', 'Tailwind CSS', 'Bootstrap', 'React'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Catalog Header */}
      <div className="mb-8 bg-paper-surface border border-paper-border rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper-accentTint text-paper-accent text-xs font-semibold mb-3">
            <span>🏛️ Component-Based Software Engineering (CBSE)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-paper-text tracking-tight font-mono">
            Software Component Catalog
          </h1>
          <p className="mt-2 text-sm text-paper-muted leading-relaxed">
            Discover, preview, and reuse production-ready UI components across your organization. 
            Avoid rebuilding common modules like login cards, navbars, modals, and search bars.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-paper-muted" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components by name, description, author, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-paper-bg border border-paper-border rounded-xl text-paper-text text-sm placeholder-paper-muted focus:outline-none focus:ring-2 focus:ring-paper-accent focus:border-transparent transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-paper-muted hover:text-paper-text"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort components"
              className="px-3 py-2.5 bg-paper-bg border border-paper-border rounded-xl text-paper-text text-xs font-medium focus:outline-none focus:ring-2 focus:ring-paper-accent"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="downloads">Sort: Most Downloaded</option>
              <option value="views">Sort: Most Viewed</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Framework Quick Filter Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-paper-border">
          <span className="text-xs font-semibold text-paper-muted mr-1">Framework:</span>
          <button
            type="button"
            onClick={() => setSelectedFramework('')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedFramework === ''
                ? 'bg-paper-accent text-white'
                : 'bg-paper-bg text-paper-text hover:bg-paper-border/50 border border-paper-border'
            }`}
          >
            All Frameworks
          </button>
          {frameworks.map(fw => (
            <button
              key={fw}
              type="button"
              onClick={() => setSelectedFramework(fw === selectedFramework ? '' : fw)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedFramework === fw
                  ? 'bg-paper-accent text-white'
                  : 'bg-paper-bg text-paper-text hover:bg-paper-border/50 border border-paper-border'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Faceted Filters */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Category Filter */}
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
                Categories
              </h3>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-[11px] text-paper-accent hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  selectedCategory === ''
                    ? 'bg-paper-accentTint text-paper-accent font-semibold'
                    : 'text-paper-text hover:bg-paper-bg'
                }`}
              >
                <span>All Categories</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name === selectedCategory ? '' : cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-paper-accentTint text-paper-accent font-semibold'
                      : 'text-paper-text hover:bg-paper-bg'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-paper-bg border border-paper-border text-paper-muted">
                    {cat.component_count || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-muted font-mono">
                Minimum Rating
              </h3>
              {minRating && (
                <button
                  type="button"
                  onClick={() => setMinRating('')}
                  className="text-[11px] text-paper-accent hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              {[
                { label: 'Any Rating', val: '' },
                { label: '4.0 Stars & Above', val: '4' },
                { label: '4.5 Stars & Above', val: '4.5' },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    minRating === r.val
                      ? 'bg-paper-accentTint text-paper-accent font-semibold'
                      : 'text-paper-text hover:bg-paper-bg'
                  }`}
                >
                  <Star size={13} className={minRating === r.val ? 'fill-paper-accent' : 'text-paper-muted'} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Components Grid */}
        <main className="lg:col-span-3">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-mono text-paper-muted">
              Showing <strong className="text-paper-text">{components.length}</strong> reusable components
            </span>

            {(search || selectedCategory || selectedFramework || minRating) && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-paper-accent hover:text-paper-accentHover font-medium"
              >
                <RotateCcw size={12} />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-56 rounded-xl border border-paper-border bg-paper-surface animate-pulse" />
              ))}
            </div>
          ) : components.length === 0 ? (
            <div className="bg-paper-surface border border-paper-border rounded-2xl p-12 text-center">
              <Layers size={36} className="mx-auto text-paper-muted/50 mb-3" />
              <h3 className="text-base font-bold text-paper-text font-mono">No matching components found</h3>
              <p className="text-xs text-paper-muted mt-1 max-w-sm mx-auto">
                Try adjusting your search terms or clearing the selected filters to view available components.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-paper-accent text-white hover:bg-paper-accentHover"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.id}
                  component={comp}
                  onSelect={onSelectComponent}
                  onQuickPreview={setPreviewComponent}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick Live Preview Modal */}
      {previewComponent && (
        <LivePreviewModal
          component={previewComponent}
          onClose={() => setPreviewComponent(null)}
          onOpenDetail={(id) => {
            setPreviewComponent(null);
            onSelectComponent(id);
          }}
        />
      )}
    </div>
  );
}
