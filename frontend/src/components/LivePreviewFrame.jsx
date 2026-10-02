import React, { useMemo, useState } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';

export default function LivePreviewFrame({
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  framework = 'HTML/CSS',
  minHeight = '360px',
  showControls = true,
}) {
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [refreshKey, setRefreshKey] = useState(0);

  const srcDocContent = useMemo(() => {
    let frameworkCdn = '';
    if (framework === 'Tailwind CSS') {
      frameworkCdn = '<script src="https://cdn.tailwindcss.com"></script>';
    } else if (framework === 'Bootstrap') {
      frameworkCdn = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>';
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${frameworkCdn}
  <style>
    /* Paper theme isolation reset */
    body {
      margin: 0;
      padding: 1.25rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: transparent;
      color: #1F2421;
    }
    ${cssCode || ''}
  </style>
</head>
<body>
  ${htmlCode || '<div style="color: #6B6F68; font-style: italic;">No HTML provided</div>'}

  <script>
    try {
      ${jsCode || ''}
    } catch(err) {
      console.warn("Component script error:", err);
    }
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode, framework, refreshKey]);

  const widthStyle = deviceMode === 'mobile' 
    ? '375px' 
    : deviceMode === 'tablet' 
    ? '768px' 
    : '100%';

  return (
    <div className="flex flex-col rounded-xl border border-paper-border bg-paper-surface overflow-hidden shadow-sm">
      {showControls && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#F2EDE2] border-b border-paper-border text-xs text-paper-muted">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2B7B3]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4D1A0]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7D8C0]" />
            <span className="ml-2 font-mono text-[11px] text-paper-text font-medium">Live Preview ({framework})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-paper-surface border border-paper-border rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                title="Desktop View (100%)"
                className={`p-1.5 rounded ${deviceMode === 'desktop' ? 'bg-paper-accentTint text-paper-accent' : 'text-paper-muted hover:text-paper-text'}`}
              >
                <Monitor size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                title="Tablet View (768px)"
                className={`p-1.5 rounded ${deviceMode === 'tablet' ? 'bg-paper-accentTint text-paper-accent' : 'text-paper-muted hover:text-paper-text'}`}
              >
                <Tablet size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                title="Mobile View (375px)"
                className={`p-1.5 rounded ${deviceMode === 'mobile' ? 'bg-paper-accentTint text-paper-accent' : 'text-paper-muted hover:text-paper-text'}`}
              >
                <Smartphone size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey(k => k + 1)}
              title="Refresh Preview"
              className="p-1.5 text-paper-muted hover:text-paper-text hover:bg-paper-surface rounded border border-transparent hover:border-paper-border transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-3 bg-[#EBE7DC] flex justify-center items-start min-h-[220px] overflow-x-auto">
        <div 
          style={{ width: widthStyle, transition: 'width 0.3s ease-in-out' }}
          className="bg-paper-surface rounded-lg border border-paper-border shadow-sm overflow-hidden"
        >
          <iframe
            key={refreshKey}
            title="Component Live Preview"
            sandbox="allow-scripts"
            srcDoc={srcDocContent}
            style={{ width: '100%', minHeight, border: 'none' }}
            className="block"
          />
        </div>
      </div>
    </div>
  );
}
