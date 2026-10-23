/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { ProjectAnalysis, LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';
import { Network, CheckCircle2, GitFork, Share2, Layers, Cpu } from 'lucide-react';

interface ProjectAnalysisViewProps {
  analysis: ProjectAnalysis;
  language: LanguageMode;
}

export const ProjectAnalysisView: React.FC<ProjectAnalysisViewProps> = ({
  analysis,
  language,
}) => {
  const t = I18N_STRINGS[language];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
      {/* 1. Project Analysis Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t.projectAnalysisTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t.projectAnalysisSubtitle}
        </p>
      </div>

      {/* Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
          {t.sourceSummaryHeader}
        </h3>
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
          {language === 'fa' && analysis.sourceSummaryFa
            ? analysis.sourceSummaryFa
            : analysis.sourceSummary}
        </p>
      </div>

      {/* Inter-File Relationships & Module Graph */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            {t.moduleGraphHeader}
          </h3>
        </div>

        {analysis.relationships && analysis.relationships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.relationships.map((rel, idx) => {
              let typeBadge = 'bg-slate-800 text-slate-300';
              if (rel.type === 'uses-store') typeBadge = 'bg-amber-950 text-amber-300 border border-amber-800';
              if (rel.type === 'uses-hook') typeBadge = 'bg-sky-950 text-sky-300 border border-sky-800';
              if (rel.type === 'types') typeBadge = 'bg-purple-950 text-purple-300 border border-purple-800';
              if (rel.type === 'renders') typeBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-800';

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-sky-300 truncate font-semibold">
                      {rel.from}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0 ${typeBadge}`}>
                      {rel.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <GitFork className="w-3.5 h-3.5 text-slate-500 shrink-0 rtl:rotate-180" />
                    <span className="font-mono text-emerald-300 truncate font-medium">{rel.to}</span>
                  </div>

                  {(rel.description || rel.descriptionFa) && (
                    <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-900 pt-2 leading-relaxed">
                      {language === 'fa' && rel.descriptionFa ? rel.descriptionFa : rel.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {language === 'fa'
              ? 'ارتباط بین‌فایلی مستقیمی شناسایی نشد.'
              : 'No external module relationships detected.'}
          </p>
        )}
      </div>

      {/* Shared Modules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-purple-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            {t.sharedModulesHeader}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {analysis.sharedModules && analysis.sharedModules.length > 0 ? (
            analysis.sharedModules.map((mod, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {mod}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">
              {language === 'fa'
                ? 'ماژول مشترکی شناسایی نشد.'
                : 'No shared cross-file modules identified'}
            </span>
          )}
        </div>
      </div>

      {/* Key Migration Decisions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            {t.keyDecisionsHeader}
          </h3>
        </div>

        <ul className="space-y-2.5">
          {(language === 'fa' && analysis.keyDecisionsFa
            ? analysis.keyDecisionsFa
            : analysis.keyDecisions
          ).map((decision, index) => (
            <li
              key={index}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-300 shadow-sm"
            >
              <span className="font-mono text-sky-400 font-bold tabular-nums mt-0.5 shrink-0">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <span>{decision}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
