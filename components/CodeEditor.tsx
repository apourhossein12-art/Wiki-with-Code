/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { ProjectFile, LanguageMode } from '@/lib/types';
import { highlightCode } from '@/lib/syntax-highlighter';
import { I18N_STRINGS } from '@/lib/i18n';
import { Copy, Check, FileCode, Code, Eye } from 'lucide-react';

interface CodeEditorProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateContent: (id: string, newContent: string) => void;
  language: LanguageMode;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateContent,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'highlight' | 'edit'>('highlight');
  const t = I18N_STRINGS[language];

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      if (activeFile) {
        onUpdateContent(activeFile.id, nextVal);
      }
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500 text-xs">
        {language === 'fa' ? 'فایلی انتخاب نشده است' : 'No file selected'}
      </div>
    );
  }

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* File Tabs Strip (Horizontal scrollable with smooth touch on mobile) */}
      <div className="flex items-center bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0 px-2">
        {files.map((file) => {
          const isActive = file.id === activeFile.id;
          const fileName = file.path.split('/').pop() || file.path;
          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`min-h-[42px] flex items-center gap-2 px-3.5 py-2 text-xs border-b-2 transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-sky-300 border-sky-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono">{fileName}</span>
              {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Editor Subheader: Path & View Mode Switcher */}
      <div className="px-3 sm:px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 gap-2">
        <div className="flex items-center gap-2 font-mono truncate">
          <span className="text-slate-500 truncate max-w-[200px] sm:max-w-none">{activeFile.path}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[11px] whitespace-nowrap">
            {lines.length} {t.linesCount}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switch: Syntax Highlight vs Editable */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setMode('highlight')}
              className={`min-h-[30px] flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors active:scale-95 ${
                mode === 'highlight'
                  ? 'bg-slate-800 text-sky-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Syntax Highlighted View"
            >
              <Eye className="w-3 h-3" />
              <span>{language === 'fa' ? 'نمایش رنگی' : 'Syntax'}</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`min-h-[30px] flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors active:scale-95 ${
                mode === 'edit'
                  ? 'bg-slate-800 text-sky-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Edit code directly"
            >
              <Code className="w-3 h-3" />
              <span>{language === 'fa' ? 'ویرایش' : 'Edit'}</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="min-h-[30px] flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors text-[11px] active:scale-95"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t.copiedText : (language === 'fa' ? 'کپی' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Code Content Container */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs sm:text-[13px] leading-relaxed bg-[#0b0f17]">
        {/* Line Gutter */}
        <div
          aria-hidden="true"
          className="w-10 sm:w-12 py-3 pr-2 text-right bg-slate-950/40 text-slate-600 select-none border-r border-slate-800/60 shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i} className="tabular-nums">
              {i + 1}
            </div>
          ))}
        </div>

        {mode === 'highlight' ? (
          <div
            onClick={() => setMode('edit')}
            className="flex-1 w-full h-full p-3 overflow-auto cursor-text text-slate-200"
            title={language === 'fa' ? 'برای ویرایش متن کلیک کنید' : 'Click to edit code'}
          >
            {lines.map((line, idx) => (
              <div key={idx} className="leading-relaxed hover:bg-slate-900/40">
                <pre
                  className="font-mono whitespace-pre inline"
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(line, activeFile.language, activeFile.path) || '&nbsp;',
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={activeFile.content}
            onChange={(e) => onUpdateContent(activeFile.id, e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoFocus
            className="flex-1 w-full h-full p-3 bg-transparent text-slate-200 resize-none focus:outline-none overflow-auto font-mono text-xs sm:text-[13px] leading-relaxed selection:bg-sky-500/30"
            placeholder={language === 'fa' ? 'کدهای فایل را اینجا بنویسید...' : 'Enter file code...'}
          />
        )}
      </div>
    </div>
  );
};
