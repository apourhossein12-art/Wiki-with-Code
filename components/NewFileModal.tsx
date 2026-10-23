/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { X, FilePlus } from 'lucide-react';
import { LanguageMode } from '@/lib/types';
import { I18N_STRINGS } from '@/lib/i18n';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (path: string, content: string) => void;
  language: LanguageMode;
}

export const NewFileModal: React.FC<NewFileModalProps> = ({
  isOpen,
  onClose,
  onCreateFile,
  language,
}) => {
  const [filePath, setFilePath] = useState('src/components/NewComponent.tsx');
  const [initialContent, setInitialContent] = useState('');
  const t = I18N_STRINGS[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath.trim()) return;
    onCreateFile(filePath.trim(), initialContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">{t.newFileModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label={t.cancelBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.filePathLabel}
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g. src/hooks/useCart.ts"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.initialCodeLabel}
            </label>
            <textarea
              value={initialContent}
              onChange={(e) => setInitialContent(e.target.value)}
              placeholder="// Write initial code..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all active:scale-95 shadow-md shadow-sky-500/20"
            >
              {t.createBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
