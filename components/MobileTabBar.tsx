/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import {
  Code2,
  SlidersHorizontal,
  GitCompare,
  Network,
  Terminal,
} from 'lucide-react';
import { LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';

interface MobileTabBarProps {
  activeView: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies' | 'config';
  setActiveView: (view: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies' | 'config') => void;
  hasConvertedResult: boolean;
  language: LanguageMode;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  setActiveView,
  language,
}) => {
  const t = I18N_STRINGS[language];

  // All 5 tabs are ALWAYS fully enabled and responsive!
  const tabs = [
    {
      id: 'editor' as const,
      label: t.navEditor,
      icon: Code2,
    },
    {
      id: 'diff' as const,
      label: t.navDiff,
      icon: GitCompare,
    },
    {
      id: 'dependencies' as const,
      label: t.navDependencies,
      icon: Terminal,
    },
    {
      id: 'config' as const,
      label: t.navConfig,
      icon: SlidersHorizontal,
    },
    {
      id: 'analysis' as const,
      label: t.navAnalysis,
      icon: Network,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 select-none shadow-2xl"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-sky-400 rounded-full shadow-sm shadow-sky-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
