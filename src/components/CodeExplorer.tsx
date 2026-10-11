import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Server,
  Layers,
  Database
} from 'lucide-react';
import { CODE_FILES, CodeFile } from '../data/sourceCode';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = activeCategory === 'all' 
    ? CODE_FILES 
    : CODE_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Bar */}
      <div className="bg-slate-800/90 px-5 py-3 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Aiogram 3.x Python Kod Markazi</h2>
            <p className="text-xs text-slate-400">Modulli arxitektura va ishlab chiqarishga tayyor fayllar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Nusxa olindi!" : "Nusxalash"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Yuklab olish
          </button>
        </div>
      </div>

      {/* Main Content: Sidebar + Viewer */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left File Tree Sidebar */}
        <div className="w-72 bg-slate-800/40 border-r border-slate-800 flex flex-col">
          {/* Category Tabs */}
          <div className="p-2 border-b border-slate-800 flex flex-wrap gap-1">
            {['all', 'core', 'handlers', 'database', 'deployment'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[11px] px-2 py-1 rounded capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  selectedFile.path === file.path
                    ? 'bg-sky-600/20 text-sky-300 font-medium border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono uppercase shrink-0 ml-1">
                  {file.language}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor Viewport */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Code Header */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{selectedFile.path}</span>
            <span>{selectedFile.content.split('\n').length} qator</span>
          </div>

          {/* Syntax text */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
