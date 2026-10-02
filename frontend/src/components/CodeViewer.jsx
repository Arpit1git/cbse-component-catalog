import React, { useState } from 'react';
import { Copy, Check, Code, FileText, Sparkles } from 'lucide-react';

export default function CodeViewer({ htmlCode = '', cssCode = '', jsCode = '', usageNotes = '', framework = 'HTML/CSS' }) {
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'css' | 'js' | 'usage'
  const [copied, setCopied] = useState(false);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'html': return htmlCode;
      case 'css': return cssCode || '/* No custom CSS required */';
      case 'js': return jsCode || '// No custom JavaScript required';
      case 'usage': return usageNotes || 'No usage notes provided.';
      default: return '';
    }
  };

  const handleCopy = () => {
    const code = getActiveCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const code = getActiveCode();
  const lineCount = code ? code.split('\n').length : 1;

  return (
    <div className="rounded-xl border border-paper-border overflow-hidden bg-paper-codeBg text-paper-codeText shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171C19] border-b border-[#2D3530]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-paper-accent text-white'
                : 'text-paper-muted hover:text-paper-codeText hover:bg-[#232B25]'
            }`}
          >
            <Code size={13} />
            HTML
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'css'
                ? 'bg-paper-accent text-white'
                : 'text-paper-muted hover:text-paper-codeText hover:bg-[#232B25]'
            }`}
          >
            <Sparkles size={13} />
            CSS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('js')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'js'
                ? 'bg-paper-accent text-white'
                : 'text-paper-muted hover:text-paper-codeText hover:bg-[#232B25]'
            }`}
          >
            <Code size={13} />
            JS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'usage'
                ? 'bg-paper-accent text-white'
                : 'text-paper-muted hover:text-paper-codeText hover:bg-[#232B25]'
            }`}
          >
            <FileText size={13} />
            How to Use
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#232B25] hover:bg-[#2C362F] text-paper-codeText border border-[#3A453E] transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#48BB78]" />
              <span className="text-[#48BB78] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy {activeTab.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Area */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[420px] flex">
        {/* Line Numbers */}
        {activeTab !== 'usage' && (
          <div className="pr-4 mr-4 border-r border-[#2D3530] text-paper-muted/50 select-none text-right font-mono">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* Code String */}
        <pre className="flex-1 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
