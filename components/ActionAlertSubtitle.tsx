/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Newspaper,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  BookOpen,
  Pause,
  Play,
  Zap,
} from 'lucide-react';
import { LanguageMode, ActionAlertItem } from '@/lib/types';
import { ACTION_ALERTS, I18N_STRINGS } from '@/lib/i18n';

interface ActionAlertSubtitleProps {
  language: LanguageMode;
  onSelectSample: (sampleId: string) => void;
  onOpenGuide: () => void;
  onConvert: () => void;
  onToggleLayout: () => void;
}

export const ActionAlertSubtitle: React.FC<ActionAlertSubtitleProps> = ({
  language,
  onSelectSample,
  onOpenGuide,
  onConvert,
  onToggleLayout,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = I18N_STRINGS[language];

  const currentAlert: ActionAlertItem = ACTION_ALERTS[currentIndex] || ACTION_ALERTS[0];

  // Auto rotate ticker every 7.5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ACTION_ALERTS.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ACTION_ALERTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ACTION_ALERTS.length) % ACTION_ALERTS.length);
  };

  const handleAction = () => {
    if (!currentAlert.actionType) return;
    if (currentAlert.actionType === 'sample' && currentAlert.sampleId) {
      onSelectSample(currentAlert.sampleId);
    } else if (currentAlert.actionType === 'guide') {
      onOpenGuide();
    } else if (currentAlert.actionType === 'convert') {
      onConvert();
    } else if (currentAlert.actionType === 'monorepo') {
      onToggleLayout();
    }
  };

  const getCategoryIcon = (category: ActionAlertItem['category']) => {
    switch (category) {
      case 'educational':
        return <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'news':
        return <Newspaper className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'action':
        return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'tip':
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
  };

  const getCategoryBadgeClass = (category: ActionAlertItem['category']) => {
    switch (category) {
      case 'educational':
        return 'bg-sky-950/80 text-sky-300 border-sky-800/80';
      case 'news':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'action':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'tip':
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
    }
  };

  return (
    <aside
      className="bg-slate-950/95 border-b border-slate-800/80 px-3 sm:px-6 py-2 transition-all relative z-20 select-none overflow-hidden"
      aria-label={t.educationalAlertsHeader}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Ticker Content Section */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            {getCategoryIcon(currentAlert.category)}
            <span
              className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                currentAlert.category
              )}`}
            >
              {currentAlert.categoryTitle[language]}
            </span>
          </div>

          {/* Alert Title & Message */}
          <div className="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
            <span className="font-bold text-slate-200 hidden md:inline shrink-0">
              {currentAlert.title[language]}:
            </span>
            <span className="text-slate-300 text-xs truncate leading-snug">
              {currentAlert.message[language]}
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Interactive Button */}
          {currentAlert.actionLabel && (
            <button
              onClick={handleAction}
              className="px-2.5 py-1 text-[11px] font-bold text-sky-200 hover:text-white bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-lg flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap shrink-0 shadow-sm"
              title={currentAlert.title[language]}
            >
              <span>{currentAlert.actionLabel[language]}</span>
              <ArrowUpRight className="w-3 h-3 text-sky-400" />
            </button>
          )}

          {/* Carousel Arrows (Mobile Touch Friendly) */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800/90 rounded-lg p-0.5">
            <button
              onClick={language === 'fa' ? handleNext : handlePrev}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors active:scale-95"
              aria-label="Previous alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-6 h-6 hidden sm:flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors active:scale-95 text-[10px]"
              aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
              title={isPaused ? 'Resume auto-rotate' : 'Pause'}
            >
              {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={language === 'fa' ? handlePrev : handleNext}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors active:scale-95"
              aria-label="Next alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
