/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { ConvertedFile, ProjectFile, LanguageMode } from '@/lib/types';
import { computeDiff, DiffLine } from '@/lib/converter-utils';
import { highlightCode } from '@/lib/syntax-highlighter';
import { I18N_STRINGS } from '@/lib/i18n';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Info,
  Archive,
  Code2,
  GitCompare,
  Eye,
  FileDown,
} from 'lucide-react';

interface DiffViewerProps {
  convertedFiles: ConvertedFile[];
  sourceFiles: ProjectFile[];
  onDownloadFile: (file: ConvertedFile) => void;
  onExportZip?: () => void;
  language: LanguageMode;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  convertedFiles,
  sourceFiles,
  onDownloadFile,
  onExportZip,
  language,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(convertedFiles[0]?.path || '');
  const [displayMode, setDisplayMode] = useState<'final' | 'diff'>('final');
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [mobileDiffTab, setMobileDiffTab] = useState<'target' | 'source'>('target');
  const [copied, setCopied] = useState(false);
  const t = I18N_STRINGS[language];

  const activeConverted =
    convertedFiles.find((f) => f.path === selectedPath) || convertedFiles[0];

  const originalFile = sourceFiles.find(
    (s) =>
      s.path === activeConverted?.originalPath ||
      s.path.split('/').pop()?.split('.')[0] ===
        activeConverted?.path.split('/').pop()?.split('.')[0]
  );

  const handleCopy = async () => {
    if (!activeConverted) return;
    await navigator.clipboard.writeText(activeConverted.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeConverted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
        {language === 'fa' ? 'فایل تبدیل‌شده‌ای موجود نیست' : 'No converted files available'}
      </div>
    );
  }

  const diffLines: DiffLine[] = computeDiff(
    originalFile?.content || '',
    activeConverted.content
  );
  const originalLines = (originalFile?.content || '').split('\n');
  const convertedLines = activeConverted.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* 1. Converted File Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-2 shrink-0 overflow-x-auto gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {convertedFiles.map((f) => {
            const isSelected = f.path === activeConverted.path;
            const fileName = f.path.split('/').pop() || f.path;
            return (
              <button
                key={f.path}
                onClick={() => setSelectedPath(f.path)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-sky-950 text-sky-200 border border-sky-800 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-mono">{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Save File + Copy + Download ZIP */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
            title="Copy target file"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
            <span className="text-[11px] sm:text-xs">{copied ? t.copiedText : t.copyTargetBtn}</span>
          </button>

          <button
            onClick={() => onDownloadFile(activeConverted)}
            className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 hover:text-emerald-100 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            title={t.downloadBtn}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">{t.downloadBtn}</span>
          </button>

          {onExportZip && (
            <button
              onClick={onExportZip}
              className="min-h-[36px] hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all active:scale-95"
              title={t.exportZipBtn}
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top View Mode Segmented Controls: [ Clean Final Code | Diff Compare ] */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setDisplayMode('final')}
            className={`min-h-[32px] flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-bold active:scale-95 ${
              displayMode === 'final'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.finalCodeTab}</span>
          </button>
          <button
            onClick={() => setDisplayMode('diff')}
            className={`min-h-[32px] flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-bold active:scale-95 ${
              displayMode === 'diff'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{t.diffCompareTab}</span>
          </button>
        </div>

        {/* If in Diff mode: split vs unified toggle */}
        {displayMode === 'diff' && (
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDiffMode('split')}
              className={`min-h-[28px] px-2.5 py-0.5 rounded-lg transition-colors active:scale-95 ${
                diffMode === 'split' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
              }`}
            >
              {t.diffSideBySide}
            </button>
            <button
              onClick={() => setDiffMode('unified')}
              className={`min-h-[28px] px-2.5 py-0.5 rounded-lg transition-colors active:scale-95 ${
                diffMode === 'unified' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
              }`}
            >
              {t.diffUnified}
            </button>
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="text-sky-300 font-bold">{activeConverted.path}</span>
          <span>•</span>
          <span>{convertedLines.length} {t.linesCount}</span>
        </div>
      </div>

      {/* 3. Transformation Rationale Explanation Card */}
      {(activeConverted.explanation || activeConverted.explanationFa) && (
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-start gap-2.5 shrink-0">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs flex-1 min-w-0">
            <span className="font-bold text-slate-200">{t.transformationRationale} </span>
            <span className="text-slate-300 leading-relaxed">
              {language === 'fa' && activeConverted.explanationFa
                ? activeConverted.explanationFa
                : activeConverted.explanation}
            </span>
          </div>
        </div>
      )}

      {/* 4. Main Code & Diff Content Area */}
      <div className="flex-1 overflow-auto bg-[#0b0f17] font-mono text-xs sm:text-[13px] leading-relaxed pb-20 md:pb-4">
        {displayMode === 'final' ? (
          /* ===================================================
           * Mode A: CLEAN FINAL CONVERTED OUTPUT (Pure Code)
           * =================================================== */
          <div className="flex h-full min-h-full">
            {/* Gutter */}
            <div
              aria-hidden="true"
              className="w-10 sm:w-12 py-3 pr-2 text-right bg-slate-950/40 text-slate-600 select-none border-r border-slate-800/60 shrink-0 overflow-hidden"
            >
              {convertedLines.map((_, i) => (
                <div key={i} className="tabular-nums">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Pristine Converted Output */}
            <div className="flex-1 p-3 overflow-auto text-slate-200">
              {convertedLines.map((line, idx) => (
                <div key={idx} className="leading-relaxed hover:bg-slate-900/40">
                  <pre
                    className="font-mono whitespace-pre inline"
                    dangerouslySetInnerHTML={{
                      __html:
                        highlightCode(line, activeConverted.language, activeConverted.path) ||
                        '&nbsp;',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ===================================================
           * Mode B: DIFF COMPARISON (Split / Unified)
           * =================================================== */
          diffMode === 'split' ? (
            <>
              {/* Desktop Side-by-Side View */}
              <div className="hidden md:grid md:grid-cols-2 h-full divide-x divide-slate-800">
                {/* Left: Source File */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
                    <span className="font-bold text-slate-300">
                      {t.sourceFileLabel}: {originalFile?.path || 'Original'}
                    </span>
                    <span className="tabular-nums text-slate-500 font-mono">
                      {originalLines.length} {t.linesCount}
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-3 text-slate-300">
                    {originalLines.map((line, idx) => (
                      <div key={idx} className="flex hover:bg-slate-900/60 leading-relaxed">
                        <span className="w-10 text-right pr-4 text-slate-600 select-none tabular-nums shrink-0">
                          {idx + 1}
                        </span>
                        <pre
                          className="flex-1 font-mono whitespace-pre text-slate-300"
                          dangerouslySetInnerHTML={{
                            __html:
                              highlightCode(
                                line,
                                originalFile?.language || 'typescript',
                                originalFile?.path
                              ) || '&nbsp;',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Target Converted File */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-4 py-2 bg-sky-950/40 border-b border-slate-800 text-xs text-sky-300 flex items-center justify-between shrink-0">
                    <span className="font-bold text-sky-200">
                      {t.targetFileLabel}: {activeConverted.path}
                    </span>
                    <span className="tabular-nums text-sky-400/80 font-mono">
                      {convertedLines.length} {t.linesCount}
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-3 text-slate-200 bg-sky-950/5">
                    {convertedLines.map((line, idx) => (
                      <div key={idx} className="flex hover:bg-sky-900/20 leading-relaxed">
                        <span className="w-10 text-right pr-4 text-slate-600 select-none tabular-nums shrink-0">
                          {idx + 1}
                        </span>
                        <pre
                          className="flex-1 font-mono whitespace-pre"
                          dangerouslySetInnerHTML={{
                            __html:
                              highlightCode(
                                line,
                                activeConverted.language,
                                activeConverted.path
                              ) || '&nbsp;',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile View with Segmented Toggle (Source ⟷ Target) */}
              <div className="md:hidden flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-center p-2 bg-slate-950 border-b border-slate-800">
                  <div className="grid grid-cols-2 w-full max-w-sm bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setMobileDiffTab('target')}
                      className={`min-h-[36px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        mobileDiffTab === 'target'
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.viewTarget}</span>
                    </button>
                    <button
                      onClick={() => setMobileDiffTab('source')}
                      className={`min-h-[36px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        mobileDiffTab === 'source'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.viewSource}</span>
                    </button>
                  </div>
                </div>

                {mobileDiffTab === 'target' ? (
                  <div className="flex flex-col h-full">
                    <div className="px-3 py-1.5 bg-sky-950/60 border-b border-slate-800 text-xs text-sky-300 flex items-center justify-between shrink-0">
                      <span className="font-bold text-sky-200 truncate">{activeConverted.path}</span>
                      <span className="tabular-nums text-sky-400 text-[11px] font-mono shrink-0">
                        {convertedLines.length} {t.linesCount}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto p-3 text-slate-200 bg-sky-950/5">
                      {convertedLines.map((line, idx) => (
                        <div key={idx} className="flex hover:bg-sky-900/20 leading-relaxed">
                          <span className="w-8 text-right pr-2 text-slate-600 select-none tabular-nums shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <pre
                            className="flex-1 font-mono whitespace-pre"
                            dangerouslySetInnerHTML={{
                              __html:
                                highlightCode(
                                  line,
                                  activeConverted.language,
                                  activeConverted.path
                                ) || '&nbsp;',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
                      <span className="font-bold text-slate-300 truncate">
                        {originalFile?.path || 'Original'}
                      </span>
                      <span className="tabular-nums text-slate-500 text-[11px] font-mono shrink-0">
                        {originalLines.length} {t.linesCount}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto p-3 text-slate-300">
                      {originalLines.map((line, idx) => (
                        <div key={idx} className="flex hover:bg-slate-900/60 leading-relaxed">
                          <span className="w-8 text-right pr-2 text-slate-600 select-none tabular-nums shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <pre
                            className="flex-1 font-mono whitespace-pre text-slate-300"
                            dangerouslySetInnerHTML={{
                              __html:
                                highlightCode(
                                  line,
                                  originalFile?.language || 'typescript',
                                  originalFile?.path
                                ) || '&nbsp;',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Unified Diff View */
            <div className="p-3 sm:p-4 space-y-0.5">
              <div className="mb-3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <span className="truncate">
                  <strong className="text-rose-400">{originalFile?.path || 'source'}</strong> ➔{' '}
                  <strong className="text-emerald-400">{activeConverted.path}</strong>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {diffLines.length} {language === 'fa' ? 'خط بررسی شد' : 'diff elements'}
                </span>
              </div>

              {diffLines.map((d, index) => {
                let bg = '';
                let textColor = 'text-slate-300';
                let prefix = ' ';
                if (d.type === 'add') {
                  bg = 'bg-emerald-950/40 text-emerald-300';
                  textColor = 'text-emerald-300';
                  prefix = '+';
                } else if (d.type === 'remove') {
                  bg = 'bg-rose-950/40 text-rose-300';
                  textColor = 'text-rose-300';
                  prefix = '-';
                }

                return (
                  <div key={index} className={`flex px-2 py-0.5 rounded-sm ${bg} leading-relaxed`}>
                    <span className="w-8 sm:w-10 text-right pr-2 text-slate-600 select-none tabular-nums shrink-0 text-[11px]">
                      {d.oldLine || ''}
                    </span>
                    <span className="w-8 sm:w-10 text-right pr-2 sm:pr-3 text-slate-600 select-none tabular-nums shrink-0 text-[11px]">
                      {d.newLine || ''}
                    </span>
                    <span className="w-4 sm:w-5 text-center text-slate-500 select-none font-bold shrink-0">
                      {prefix}
                    </span>
                    <pre
                      className={`flex-1 font-mono whitespace-pre ${textColor}`}
                      dangerouslySetInnerHTML={{
                        __html:
                          highlightCode(
                            d.text,
                            activeConverted.language,
                            activeConverted.path
                          ) || '&nbsp;',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};
