/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import {
  FrameworkStack,
  TargetFrameworkStack,
  ConversionConfig,
  LanguageMode,
} from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';
import { ArrowRight, Layers, Cpu, Sparkles } from 'lucide-react';

interface StackConfigBarProps {
  config: ConversionConfig;
  onChangeConfig: (newConfig: Partial<ConversionConfig>) => void;
  onSelectSample: (sampleId: string) => void;
  selectedSampleId?: string;
  language: LanguageMode;
}

const SOURCE_OPTIONS: Array<{ value: FrameworkStack; label: string; labelFa: string }> = [
  { value: 'react', label: 'React (TSX / Hooks)', labelFa: 'ری‌اکت (TSX / هوک‌ها)' },
  { value: 'vue', label: 'Vue 3 (Composition / Pinia)', labelFa: 'ویو ۳ (کامپوزیشن / پینیا)' },
  { value: 'svelte', label: 'Svelte 5 (Runes)', labelFa: 'اسولت ۵ (ران‌ها)' },
  { value: 'angular', label: 'Angular 19 (Signals)', labelFa: 'انگولار ۱۹ (سیگنال‌ها)' },
  { value: 'solid', label: 'Solid.js', labelFa: 'سالید جی‌اس (Solid)' },
  { value: 'laravel-blade', label: 'Laravel Blade', labelFa: 'لاراول بلید (Blade)' },
  { value: 'class-components', label: 'React Class Components', labelFa: 'ری‌اکت کلاس کامپوننت قدیمی' },
  { value: 'css', label: 'Vanilla CSS / BEM', labelFa: 'سی‌اس‌اس سنتی / BEM' },
];

const TARGET_OPTIONS: Array<{ value: TargetFrameworkStack; label: string; labelFa: string }> = [
  { value: 'vue', label: 'Vue 3 (<script setup> + Pinia)', labelFa: 'ویو ۳ (<script setup> + پینیا)' },
  { value: 'react', label: 'React 19 (Functional + Hooks)', labelFa: 'ری‌اکت ۱۹ (تابعی + هوک‌ها)' },
  { value: 'svelte', label: 'Svelte 5 ($state runes)', labelFa: 'اسولت ۵ (ران‌های $state)' },
  { value: 'angular', label: 'Angular 19 (Standalone Signals)', labelFa: 'انگولار ۱۹ (سیگنال استندالون)' },
  { value: 'solid', label: 'Solid.js', labelFa: 'سالید جی‌اس (Solid)' },
  { value: 'laravel-inertia-react', label: 'Laravel + Inertia.js (React)', labelFa: 'لاراول + اینرشیا (React)' },
  { value: 'laravel-inertia-vue', label: 'Laravel + Inertia.js (Vue)', labelFa: 'لاراول + اینرشیا (Vue)' },
  { value: 'livewire', label: 'Livewire 3 (Full-Stack Component)', labelFa: 'لایووایر ۳ (کامپوننت فول‌استک)' },
  { value: 'tailwind', label: 'Tailwind CSS v4', labelFa: 'تیلویند CSS v4' },
];

export const StackConfigBar: React.FC<StackConfigBarProps> = ({
  config,
  onChangeConfig,
  onSelectSample,
  selectedSampleId,
  language,
}) => {
  const t = I18N_STRINGS[language];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Framework Stack Selectors */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium shrink-0">{t.sourceStack}</span>
          <select
            value={config.sourceStack}
            onChange={(e) => onChangeConfig({ sourceStack: e.target.value as FrameworkStack })}
            className="min-h-[38px] bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 font-medium"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {language === 'fa' ? opt.labelFa : opt.label}
              </option>
            ))}
          </select>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium shrink-0">{t.targetStack}</span>
          <select
            value={config.targetStack}
            onChange={(e) => onChangeConfig({ targetStack: e.target.value as TargetFrameworkStack })}
            className="min-h-[38px] bg-slate-950 border border-sky-800/80 text-sky-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-sky-400 font-medium"
          >
            {TARGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {language === 'fa' ? opt.labelFa : opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden md:block mx-1" />

        {/* Layout mode (Standard vs Monorepo) */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeConfig({ architecture: 'standard' })}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap active:scale-95 ${
                config.architecture === 'standard'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.standardLayout}
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ architecture: 'monorepo' })}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap active:scale-95 ${
                config.architecture === 'monorepo'
                  ? 'bg-sky-950 text-sky-300 font-medium border border-sky-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.monorepoLayout}
            </button>
          </div>
        </div>

        {/* TypeScript Toggle */}
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            type="button"
            onClick={() => onChangeConfig({ useTypeScript: !config.useTypeScript })}
            className={`min-h-[32px] px-2.5 py-1 rounded-xl border text-xs font-mono font-medium transition-colors active:scale-95 ${
              config.useTypeScript
                ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            {config.useTypeScript ? t.tsMode : t.jsMode}
          </button>
        </div>
      </div>

      {/* Preset Multi-file Templates */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-slate-400 shrink-0">{t.templateLabel}</span>
        <select
          value={selectedSampleId || ''}
          onChange={(e) => {
            if (e.target.value) onSelectSample(e.target.value);
          }}
          className="min-h-[38px] flex-1 sm:flex-initial bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 font-medium"
        >
          <option value="" disabled>
            {t.chooseTemplate}
          </option>
          <option value="react-cart-auth">
            {language === 'fa' ? 'سبد خرید ری‌اکت به ویو ۳ (۵ فایل)' : 'React TS Shopping Cart to Vue 3 (5 files)'}
          </option>
          <option value="vue-pinia-tasks">
            {language === 'fa' ? 'تسک منیجر ویو ۳ به ری‌اکت ۱۹ (۴ فایل)' : 'Vue 3 Pinia Task Manager to React 19 (4 files)'}
          </option>
          <option value="react-to-svelte5">
            {language === 'fa' ? 'ری‌اکت به Svelte 5 ران‌ها (۳ فایل)' : 'React TS to Svelte 5 Runes (3 files)'}
          </option>
          <option value="laravel-blade-dashboard">
            {language === 'fa' ? 'لاراول بلید به اینرشیا ری‌اکت (۴ فایل)' : 'Laravel Blade to Inertia.js (4 files)'}
          </option>
          <option value="css-to-tailwind">
            {language === 'fa' ? 'سی‌اس‌اس قدیمی به Tailwind v4 (۳ فایل)' : 'CSS to Tailwind CSS v4 (3 files)'}
          </option>
        </select>
      </div>
    </div>
  );
};
