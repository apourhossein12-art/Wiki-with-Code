/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { DependencyUpdates, TargetFrameworkStack, LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';
import {
  Package,
  Terminal as TerminalIcon,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Minus,
  Play,
  RotateCcw,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DependenciesViewProps {
  updates: DependencyUpdates;
  migrationNotes: string[];
  migrationNotesFa?: string[];
  targetStack: TargetFrameworkStack;
  language: LanguageMode;
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({
  updates,
  migrationNotes,
  migrationNotesFa,
  targetStack,
  language,
}) => {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedPackageJson, setCopiedPackageJson] = useState(false);
  const [activeCliTab, setActiveCliTab] = useState<'install' | 'dev' | 'build' | 'json'>('install');
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simOutput, setSimOutput] = useState<string[]>([]);
  const t = I18N_STRINGS[language];

  const packagesToAdd = Object.entries(updates.packageJson?.add || {});
  const packagesToRemove = updates.packageJson?.remove || [];

  const installCommand =
    packagesToAdd.length > 0
      ? `npm install ${packagesToAdd.map(([pkg]) => pkg).join(' ')}`
      : 'npm install';

  const devCommand = 'npm run dev';
  const buildCommand = 'npm run build';

  const generatedPackageJson = {
    name: 'converted-project',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: targetStack === 'vue' ? 'vite' : targetStack === 'svelte' ? 'vite' : 'next dev',
      build: targetStack === 'vue' ? 'vue-tsc && vite build' : 'vite build',
      preview: 'vite preview',
    },
    dependencies: updates.packageJson?.add || {},
  };

  const handleCopyInstall = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopyPackageJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(generatedPackageJson, null, 2));
    setCopiedPackageJson(true);
    setTimeout(() => setCopiedPackageJson(false), 2000);
  };

  const handleDownloadPackageJson = () => {
    const blob = new Blob([JSON.stringify(generatedPackageJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Interactive Terminal Simulator Run
  const handleRunSimulation = () => {
    setIsRunningSim(true);
    setSimOutput([`$ ${activeCliTab === 'install' ? installCommand : activeCliTab === 'dev' ? devCommand : buildCommand}`]);

    setTimeout(() => {
      if (activeCliTab === 'install') {
        setSimOutput((prev) => [
          ...prev,
          `resolving dependencies...`,
          `fetch metadata for ${packagesToAdd.length} package(s)...`,
          `+ ${packagesToAdd.map(([p, v]) => `${p}@${v}`).join(', ')}`,
          `added ${packagesToAdd.length} packages, and audited 148 packages in 1.2s`,
          `found 0 vulnerabilities`,
          `✓ Command completed with status 0`,
        ]);
      } else if (activeCliTab === 'dev') {
        setSimOutput((prev) => [
          ...prev,
          `> converted-project@1.0.0 dev`,
          `> vite --host`,
          `  VITE v5.4.0  ready in 184 ms`,
          `  ➜  Local:   http://localhost:3000/`,
          `  ➜  Network: http://192.168.1.45:3000/`,
          `  ➜  press h + enter to show help`,
        ]);
      } else {
        setSimOutput((prev) => [
          ...prev,
          `> converted-project@1.0.0 build`,
          `vite v5.4.0 building for production...`,
          `transforming (24) modules...`,
          `✓ 24 modules transformed.`,
          `dist/index.html                   0.48 kB │ gzip:  0.31 kB`,
          `dist/assets/index-D7b3.css        1.20 kB │ gzip:  0.64 kB`,
          `dist/assets/index-B4x9.js        48.12 kB │ gzip: 16.40 kB`,
          `✓ built in 340ms`,
        ]);
      }
      setIsRunningSim(false);
    }, 700);
  };

  const activeNotes = language === 'fa' && migrationNotesFa ? migrationNotesFa : migrationNotes;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TerminalIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t.dependenciesTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t.dependenciesSubtitle}
        </p>
      </div>

      {/* =========================================================
       * 1. Interactive Terminal & CLI Console (Requested Feature)
       * ========================================================= */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b12] overflow-hidden shadow-2xl">
        {/* Terminal Title Bar (macOS / Linux style) */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="font-mono text-xs text-slate-400 font-medium ml-2">
              bash — {targetStack} CLI runner
            </span>
          </div>

          {/* Terminal Tabs: Install | Dev | Build | package.json */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveCliTab('install');
                setSimOutput([]);
              }}
              className={`min-h-[30px] px-2.5 py-0.5 rounded-lg transition-colors font-mono font-medium active:scale-95 ${
                activeCliTab === 'install'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              npm install
            </button>
            <button
              onClick={() => {
                setActiveCliTab('dev');
                setSimOutput([]);
              }}
              className={`min-h-[30px] px-2.5 py-0.5 rounded-lg transition-colors font-mono font-medium active:scale-95 ${
                activeCliTab === 'dev'
                  ? 'bg-slate-800 text-sky-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              npm run dev
            </button>
            <button
              onClick={() => {
                setActiveCliTab('build');
                setSimOutput([]);
              }}
              className={`min-h-[30px] px-2.5 py-0.5 rounded-lg transition-colors font-mono font-medium active:scale-95 ${
                activeCliTab === 'build'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              npm run build
            </button>
            <button
              onClick={() => {
                setActiveCliTab('json');
                setSimOutput([]);
              }}
              className={`min-h-[30px] px-2.5 py-0.5 rounded-lg transition-colors font-mono font-medium active:scale-95 ${
                activeCliTab === 'json'
                  ? 'bg-slate-800 text-amber-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              package.json
            </button>
          </div>
        </div>

        {/* Command Toolbar */}
        <div dir="ltr" className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-left">
          <div className="flex items-center gap-2 overflow-x-auto min-w-0 font-mono text-xs">
            <span className="text-emerald-400 select-none">$</span>
            <span className="text-slate-200 font-bold select-all truncate">
              {activeCliTab === 'install'
                ? installCommand
                : activeCliTab === 'dev'
                ? devCommand
                : activeCliTab === 'build'
                ? buildCommand
                : 'cat package.json'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeCliTab !== 'json' ? (
              <>
                <button
                  onClick={() =>
                    handleCopyInstall(
                      activeCliTab === 'install'
                        ? installCommand
                        : activeCliTab === 'dev'
                        ? devCommand
                        : buildCommand
                    )
                  }
                  className="min-h-[34px] flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                >
                  {copiedInstall ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span>{copiedInstall ? t.copiedText : t.copyCommandBtn}</span>
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunningSim}
                  className="min-h-[34px] flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isRunningSim ? 'animate-spin' : ''}`} />
                  <span>{isRunningSim ? t.terminalRunning : t.runTerminalBtn}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopyPackageJson}
                  className="min-h-[34px] flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                >
                  {copiedPackageJson ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{copiedPackageJson ? t.copiedText : 'Copy package.json'}</span>
                </button>
                <button
                  onClick={handleDownloadPackageJson}
                  className="min-h-[34px] flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save package.json</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div dir="ltr" className="p-4 sm:p-5 font-mono text-xs leading-relaxed min-h-[140px] max-h-[260px] overflow-y-auto text-left">
          {activeCliTab === 'json' ? (
            <pre className="text-amber-300 whitespace-pre">
              {JSON.stringify(generatedPackageJson, null, 2)}
            </pre>
          ) : simOutput.length > 0 ? (
            <div className="space-y-1">
              {simOutput.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.startsWith('$')
                      ? 'text-sky-300 font-bold'
                      : log.startsWith('✓')
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 font-sans flex flex-col items-center justify-center py-6 text-center space-y-2">
              <TerminalIcon className="w-6 h-6 text-emerald-400/80" />
              <p className="text-xs text-slate-300 font-medium">{t.terminalStatusReady}</p>
              <button
                onClick={handleRunSimulation}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold"
              >
                {t.runTerminalBtn}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
       * 2. Package Additions & Removals Delta Grid
       * ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Packages to Add */}
        <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <Plus className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {t.packagesToAdd} ({packagesToAdd.length})
            </h3>
          </div>

          {packagesToAdd.length > 0 ? (
            <ul className="space-y-2">
              {packagesToAdd.map(([name, ver]) => (
                <li
                  key={name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs font-mono"
                >
                  <span className="text-emerald-300 font-bold">{name}</span>
                  <span className="text-emerald-400/80">{ver}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {language === 'fa' ? 'بسته npm جدیدی مورد نیاز نیست.' : 'No additional npm packages required.'}
            </p>
          )}
        </div>

        {/* Packages to Remove */}
        <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-rose-400">
            <Minus className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {t.packagesToRemove} ({packagesToRemove.length})
            </h3>
          </div>

          {packagesToRemove.length > 0 ? (
            <ul className="space-y-2">
              {packagesToRemove.map((name) => (
                <li
                  key={name}
                  className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs font-mono text-rose-300"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {language === 'fa' ? 'نیازی به حذف بسته‌ای نیست.' : 'No deprecated packages need removal.'}
            </p>
          )}
        </div>
      </div>

      {/* Composer Updates (for Laravel) */}
      {updates.composerJson?.add && Object.keys(updates.composerJson.add).length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
            {t.composerPackages}
          </h3>
          <ul className="space-y-2">
            {Object.entries(updates.composerJson.add).map(([pkg, ver]) => (
              <li
                key={pkg}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs font-mono"
              >
                <span className="text-purple-300 font-bold">{pkg}</span>
                <span className="text-purple-400">{ver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Migration Gotchas & Nuances */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            {t.migrationGotchasHeader}
          </h3>
        </div>

        <ul className="space-y-2.5">
          {activeNotes.map((note, idx) => (
            <li
              key={idx}
              className="p-3.5 bg-slate-950 border border-amber-900/30 rounded-xl text-xs leading-relaxed text-slate-300 flex items-start gap-2.5 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
