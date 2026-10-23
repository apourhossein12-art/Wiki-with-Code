/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import {
  ArrowRightLeft,
  Download,
  RefreshCw,
  FolderTree,
  Languages,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';

interface HeaderProps {
  onConvert: () => void;
  isConverting: boolean;
  onExportZip: () => void;
  hasConvertedResult: boolean;
  activeView: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies' | 'config';
  setActiveView: (view: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies' | 'config') => void;
  fileCount: number;
  engine?: 'gemini-3.8-flash' | 'ast-deterministic';
  latencyMs?: number;
  language: LanguageMode;
  onToggleLanguage: () => void;
  onOpenMobileDrawer: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConvert,
  isConverting,
  onExportZip,
  hasConvertedResult,
  activeView,
  setActiveView,
  fileCount,
  engine,
  latencyMs,
  language,
  onToggleLanguage,
  onOpenMobileDrawer,
  onOpenGuide,
}) => {
  const t = I18N_STRINGS[language];

  return (
    <header className="pt-safe border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30 select-none shrink-0 transition-colors">
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left / Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile File Drawer Button (iPhone friendly 44px target) */}
          <button
            onClick={onOpenMobileDrawer}
            className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl active:scale-95 transition-transform"
            aria-label={t.sourceTreeTitle}
            title={t.sourceTreeTitle}
          >
            <FolderTree className="w-4 h-4 text-sky-400" />
          </button>

          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ArrowRightLeft className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  {t.brandName}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-400 font-medium">
                  {t.versionBadge}
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Center Navigation Tabs (Visible on Tablet/Desktop, controlled by Bottom Nav on iPhone) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveView('editor')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'editor'
                ? 'bg-slate-900 text-sky-400 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {t.navEditor} ({fileCount})
          </button>
          <button
            onClick={() => setActiveView('diff')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'diff'
                ? 'bg-slate-900 text-sky-400 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {t.navDiff}
          </button>
          <button
            onClick={() => setActiveView('dependencies')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'dependencies'
                ? 'bg-slate-900 text-sky-400 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {t.navDependencies}
          </button>
          <button
            onClick={() => setActiveView('analysis')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'analysis'
                ? 'bg-slate-900 text-sky-400 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {t.navAnalysis}
          </button>
          <button
            onClick={() => setActiveView('structure')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'structure'
                ? 'bg-slate-900 text-sky-400 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {t.navStructure}
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Guide Modal Trigger */}
          <button
            onClick={onOpenGuide}
            className="min-h-[38px] px-2.5 sm:px-3 flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all active:scale-95"
            title={t.educationalModalTitle}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">{t.viewGuideBtn}</span>
          </button>

          {/* Language Toggle (FA / EN) */}
          <button
            onClick={onToggleLanguage}
            className="min-h-[38px] min-w-[38px] px-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all active:scale-95"
            title={language === 'fa' ? 'Switch to English' : 'تغییر به زبان فارسی'}
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[11px] font-bold">
              {language === 'fa' ? 'EN' : 'فا'}
            </span>
          </button>

          {/* Engine indicator */}
          {engine && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  engine === 'gemini-3.8-flash' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-300">
                {engine === 'gemini-3.8-flash' ? t.engineGemini : t.engineDeterministic}
              </span>
              {latencyMs !== undefined && (
                <span className="text-slate-500 tabular-nums">· {latencyMs}ms</span>
              )}
            </div>
          )}

          {/* Export ZIP Button */}
          {hasConvertedResult && (
            <button
              onClick={onExportZip}
              className="min-h-[38px] px-2.5 sm:px-3 flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-xl transition-all active:scale-95 shrink-0"
              title={t.exportZipBtn}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.exportZipBtn}</span>
            </button>
          )}

          {/* Primary Convert CTA Button */}
          <button
            onClick={onConvert}
            disabled={isConverting}
            className="min-h-[38px] px-2.5 sm:px-4 flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 active:scale-95 rounded-xl shadow-md shadow-sky-500/20 transition-all shrink-0 disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] sm:text-xs">{t.convertingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">
                  {hasConvertedResult
                    ? (language === 'fa' ? 'تبدیل مجدد' : 'Re-convert')
                    : (language === 'fa' ? 'تبدیل پروژه' : 'Convert')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
