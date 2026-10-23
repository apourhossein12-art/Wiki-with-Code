/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ArrowRightLeft,
  Smartphone,
  Layers,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onSelectSample: (sampleId: string) => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'react-vue' | 'react-svelte' | 'blade-inertia' | 'monorepo' | 'iphone'>('react-vue');
  const t = I18N_STRINGS[language];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {t.educationalModalTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.educationalModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label={t.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs (Scrollable for iPhone) */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('react-vue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'react-vue'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            React ⟷ Vue 3
          </button>
          <button
            onClick={() => setActiveTab('react-svelte')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'react-svelte'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            React ⟷ Svelte 5 (Runes)
          </button>
          <button
            onClick={() => setActiveTab('blade-inertia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'blade-inertia'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Laravel ⟷ Inertia.js
          </button>
          <button
            onClick={() => setActiveTab('monorepo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'monorepo'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {language === 'fa' ? 'معماری مونو‌ریپو' : 'Monorepo'}
          </button>
          <button
            onClick={() => setActiveTab('iphone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'iphone'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {language === 'fa' ? 'راهنمای آیفون' : 'iPhone Tips'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'react-vue' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  {language === 'fa'
                    ? 'نگاشت استیت و هوک‌ها از React به Vue 3'
                    : 'Mapping State & Hooks from React to Vue 3'}
                </h3>
                <p>
                  {language === 'fa'
                    ? 'در فریم‌ورک Vue 3 با استفاده از Composition API و تگ <script setup>، مدل‌های واکنشی با کمترین سربار پیاده‌سازی می‌شوند:'
                    : 'Vue 3 with Composition API and <script setup> models reactivity with minimal boilerplate:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">React (TSX)</span>
                    <pre className="text-slate-300 whitespace-pre">
                      {`const [count, setCount] = useState(0);
const doubled = useMemo(() => count * 2, [count]);
useEffect(() => { ... }, [count]);
<CartContext.Provider value={...}>`}
                    </pre>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/40">
                    <span className="text-emerald-400 font-bold block mb-1">Vue 3 (SFC)</span>
                    <pre className="text-slate-300 whitespace-pre">
                      {`const count = ref(0);
const doubled = computed(() => count.value * 2);
watch(count, (newVal) => { ... });
export const useCartStore = defineStore(...)`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onSelectSample('react-cart-auth');
                    onClose();
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'fa' ? 'تست عملی پروژه سبد خرید' : 'Test React Cart Sample'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'react-svelte' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 mb-2">
                  {language === 'fa' ? 'معماری ران‌ها در Svelte 5' : 'Svelte 5 Runes Architecture'}
                </h3>
                <p>
                  {language === 'fa'
                    ? 'در Svelte 5 نیازی به هوک‌های پیچیده ری‌اکت یا رندرهای مجدد دستی نیست. ران‌های $state، $derived و $effect همه چیز را به شکل کامپایلری مدیریت می‌کنند.'
                    : 'In Svelte 5, complex React re-renders are replaced with fine-grained reactivity via $state, $derived, and $effect runes at compile-time.'}
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>useState(val)</strong> ➔ <code>let x = $state(val);</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>useMemo(() =&gt; fn, deps)</strong> ➔ <code>let x = $derived(fn);</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>useEffect(() =&gt; fn, deps)</strong> ➔ <code>$effect(() =&gt; fn);</code></span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onSelectSample('react-to-svelte5');
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'fa' ? 'تست نمونه Svelte 5' : 'Test Svelte 5 Sample'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'blade-inertia' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-purple-400 mb-2">
                  {language === 'fa' ? 'مدرن‌سازی لاراول بلید با Inertia.js' : 'Laravel Blade to Inertia.js'}
                </h3>
                <p>
                  {language === 'fa'
                    ? 'اینرشیا امکان استفاده از کامپوننت‌های مدرن React را بدون نیاز به ساخت API جداگانه فراهم می‌آورد. روت‌های وب مستقیماً صفحات React را با پراپ‌های سمت سرور رندر می‌کنند.'
                    : 'Inertia.js bridges Laravel with modern React without creating a REST API. Laravel web routes directly render React page components with typed props.'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onSelectSample('laravel-blade-dashboard');
                    onClose();
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'fa' ? 'تست نمونه لاراول' : 'Test Laravel Sample'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'monorepo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {language === 'fa' ? 'تفکیک بسته‌ها در مونو‌ریپو' : 'Monorepo Workspace Packages'}
                </h3>
                <p>
                  {language === 'fa'
                    ? 'ساختار مونو‌ریپو امکان اشتراک‌گذاری تایپ‌ها و لاجیک استیت بین برنامه‌های وب و موبایل را فراهم می‌کند:'
                    : 'A monorepo workspace allows sharing typed models and state logic across multiple web and mobile clients:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 font-bold block">apps/web</span>
                    <span className="text-slate-400 text-[10px]">Root shell & pages</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-purple-400 font-bold block">packages/ui</span>
                    <span className="text-slate-400 text-[10px]">Shared buttons, cards, modals</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-bold block">packages/shared</span>
                    <span className="text-slate-400 text-[10px]">Pinia stores, hooks, utils</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-bold block">packages/types</span>
                    <span className="text-slate-400 text-[10px]">Pure TypeScript interfaces</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'iphone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {language === 'fa' ? 'بهینه‌سازی‌های لمسی و ارگونومی آیفون' : 'iPhone Touch & Ergonomics Engineering'}
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>
                      {language === 'fa'
                        ? 'ناوبری ۴۰٪ پایینی (Natural Thumb Zone) با تب‌بار شناور و دکمه‌های حداقل ۴۴ پیکسلی.'
                        : 'Natural Thumb Reach Zone (bottom 40%) with floating tab bar and 44px touch targets.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>
                      {language === 'fa'
                        ? 'رعایت کامل فرورفتگی Dynamic Island و خط هوم در آیفون با استفاده از pt-safe و pb-safe.'
                        : 'Full safe-area inset compliance for Dynamic Island and Home Bar via pt-safe / pb-safe.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>
                      {language === 'fa'
                        ? 'در نمای مقایسه (Diff)، بر روی آیفون سوییچ هوشمند بین کد مبدا و مقصد فعال می‌شود تا از اسکرول افقی جلوگیری شود.'
                        : 'In mobile Diff view, a smart toggle switches between Source and Target avoiding horizontal layout distortion.'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
