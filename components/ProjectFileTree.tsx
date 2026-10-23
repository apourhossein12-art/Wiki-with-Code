/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { ProjectFile, LanguageMode } from '@/lib/types';
import { buildFolderTree, TreeNode } from '@/lib/converter-utils';
import { I18N_STRINGS } from '@/lib/i18n';
import {
  Folder,
  FolderOpen,
  FileCode,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  X,
} from 'lucide-react';

interface ProjectFileTreeProps {
  files: ProjectFile[];
  selectedFileId: string;
  onSelectFile: (fileId: string) => void;
  onAddFileClick: () => void;
  onDeleteFile: (fileId: string) => void;
  onResetFiles: () => void;
  language: LanguageMode;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const ProjectFileTree: React.FC<ProjectFileTreeProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onAddFileClick,
  onDeleteFile,
  onResetFiles,
  language,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const t = I18N_STRINGS[language];
  const tree = buildFolderTree(files);

  const toggleFolder = (path: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileBadgeColor = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'text-sky-400';
    if (name.endsWith('.vue')) return 'text-emerald-400';
    if (name.endsWith('.svelte')) return 'text-amber-400';
    if (name.endsWith('.blade.php') || name.endsWith('.php')) return 'text-purple-400';
    if (name.endsWith('.css')) return 'text-pink-400';
    return 'text-slate-400';
  };

  const renderTreeNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isCollapsed = collapsedFolders[node.path];

      if (node.isFolder) {
        return (
          <div key={node.path} className="select-none">
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full min-h-[38px] flex items-center gap-2 py-1 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-850/80 rounded-xl transition-colors text-left"
              style={{ paddingInlineStart: `${depth * 14 + 10}px` }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 rtl:rotate-180" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              {isCollapsed ? (
                <Folder className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <FolderOpen className="w-4 h-4 text-sky-300 shrink-0" />
              )}
              <span className="font-medium tracking-wide truncate">{node.name}</span>
            </button>
            {!isCollapsed && node.children && (
              <div>{renderTreeNodes(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isSelected = node.fileId === selectedFileId;
      return (
        <div
          key={node.path}
          className={`group flex items-center justify-between min-h-[40px] py-1 px-2.5 text-xs rounded-xl transition-colors select-none ${
            isSelected
              ? 'bg-sky-950/90 text-sky-200 border border-sky-800/80 font-medium'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          style={{ paddingInlineStart: `${depth * 14 + 10}px` }}
        >
          <button
            onClick={() => {
              if (node.fileId) {
                onSelectFile(node.fileId);
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }
            }}
            className="flex items-center gap-2 truncate flex-1 text-left min-h-[38px]"
          >
            <FileCode className={`w-4 h-4 shrink-0 ${getFileBadgeColor(node.name)}`} />
            <span className="truncate">{node.name}</span>
          </button>

          {files.length > 1 && node.fileId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(node.fileId!);
              }}
              className="opacity-70 group-hover:opacity-100 hover:text-rose-400 p-1.5 rounded-lg transition-opacity active:scale-90"
              title="Delete file"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    });
  };

  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);

  const treeContent = (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.sourceTreeTitle}
          </span>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            ({files.length} {t.filesCount})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddFileClick}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors active:scale-95"
            title={t.addFileBtn}
          >
            <Plus className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={onResetFiles}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors active:scale-95"
            title={t.resetFilesBtn}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors active:scale-95"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {renderTreeNodes(tree)}
      </div>

      {/* Footer Metrics */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400 flex items-center justify-between shrink-0 pb-safe">
        <span>{t.linesCount}</span>
        <span className="font-mono tabular-nums text-sky-300 font-bold">
          {totalLines.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-e border-slate-800 bg-slate-950 flex-col h-full shrink-0">
        {treeContent}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileDrawer}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {treeContent}
          </div>
        </div>
      )}
    </>
  );
};
