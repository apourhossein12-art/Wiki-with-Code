/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { TargetStructure, LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';
import { FolderGit2, ArrowRight, Package, Box, Layers, Terminal } from 'lucide-react';

interface TargetStructureViewProps {
  structure: TargetStructure;
  language: LanguageMode;
}

export const TargetStructureView: React.FC<TargetStructureViewProps> = ({
  structure,
  language,
}) => {
  const t = I18N_STRINGS[language];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t.targetStructureTitle} {structure.isMonorepo && `(${t.monorepoLayout})`}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {language === 'fa' && structure.explanationFa
            ? structure.explanationFa
            : structure.explanation || t.targetStructureSubtitle}
        </p>
      </div>

      {/* Target Tree View ASCII Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono font-semibold text-slate-200">
              {structure.isMonorepo
                ? (language === 'fa' ? 'معماری فضای کاری (Turborepo / pnpm)' : 'Workspace Architecture (Turborepo / pnpm)')
                : (language === 'fa' ? 'درخت فایل‌های پروژه مقصد' : 'Target File Tree')}
            </span>
          </div>
          <span className="text-[11px] text-sky-400 font-mono font-medium">
            {structure.isMonorepo ? t.monorepoLayout : t.standardLayout}
          </span>
        </div>
        <pre className="p-4 sm:p-5 font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto whitespace-pre">
          {structure.treeDescription}
        </pre>
      </div>

      {/* Monorepo Package Allocations (if monorepo) */}
      {structure.isMonorepo && (
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{language === 'fa' ? 'تفکیک بسته‌های مونو‌ریپو' : 'Monorepo Package Allocations'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold mb-1">
                <Box className="w-4 h-4" />
                <span>apps/web</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {language === 'fa'
                  ? 'شل اصلی برنامه، روت‌ها، لی‌اوت‌ها و فایل‌های ورودی صفحه.'
                  : 'Root shell, routes, layouts, and page entry point configurations.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold mb-1">
                <Package className="w-4 h-4" />
                <span>packages/ui</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {language === 'fa'
                  ? 'کامپوننت‌های بصری، دکمه‌ها، کارت‌ها و دیزاین سیستم.'
                  : 'Framework UI components, design system buttons, cards, and modals.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>packages/shared</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {language === 'fa'
                  ? 'استورهای واکنشی Pinia/Zustand، کامپوزبل‌ها و منطق کسب‌وکار.'
                  : 'Reactive stores (Pinia/Zustand), composables, hooks, and business logic.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-1">
                <Terminal className="w-4 h-4" />
                <span>packages/types</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {language === 'fa'
                  ? 'مدل‌ها و اینترفیس‌های تایپ‌اسکریپت مشترک بین سرویس‌ها.'
                  : 'Strict TypeScript interfaces, models, and shared schemas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Mapping Table / Cards */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
          {t.fileMappingHeader}
        </h3>

        {/* Desktop Table View */}
        <div className="hidden sm:block rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="px-4 py-3">{t.sourceFileLabel}</th>
                <th className="px-2 py-3"></th>
                <th className="px-4 py-3">{t.targetFileLabel}</th>
                <th className="px-4 py-3">{language === 'fa' ? 'دلیل انتقال' : 'Migration Rationale'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {(structure.fileMapping || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                    {item.source}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </td>
                  <td className="px-4 py-3 font-mono text-sky-300 font-bold whitespace-nowrap">
                    {item.target}
                  </td>
                  <td className="px-4 py-3 text-slate-300 leading-normal">
                    {language === 'fa' && item.reasonFa ? item.reasonFa : item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Prevents horizontal overflow on iPhone!) */}
        <div className="sm:hidden space-y-3">
          {(structure.fileMapping || []).map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 truncate max-w-[140px]">{item.source}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0 rtl:rotate-180" />
                <span className="text-sky-300 font-bold truncate max-w-[140px]">{item.target}</span>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-900 pt-2 leading-relaxed">
                {language === 'fa' && item.reasonFa ? item.reasonFa : item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
