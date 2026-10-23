/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  ProjectFile,
  ConversionConfig,
  ConversionResult,
  ConvertedFile,
  LanguageMode,
} from '@/lib/types';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';
import { detectLanguage, generateDeterministicConversion } from '@/lib/converter-utils';
import { I18N_STRINGS } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { ActionAlertSubtitle } from '@/components/ActionAlertSubtitle';
import { StackConfigBar } from '@/components/StackConfigBar';
import { ProjectFileTree } from '@/components/ProjectFileTree';
import { CodeEditor } from '@/components/CodeEditor';
import { DiffViewer } from '@/components/DiffViewer';
import { ProjectAnalysisView } from '@/components/ProjectAnalysisView';
import { TargetStructureView } from '@/components/TargetStructureView';
import { DependenciesView } from '@/components/DependenciesView';
import { MobileTabBar } from '@/components/MobileTabBar';
import { EducationalModal } from '@/components/EducationalModal';
import { NewFileModal } from '@/components/NewFileModal';
import { AlertCircle, SlidersHorizontal, ArrowRight, Sparkles, Package, Terminal } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<LanguageMode>('fa');
  const initialSample = SAMPLE_PROJECTS[0];

  const [files, setFiles] = useState<ProjectFile[]>(initialSample.files);
  const [activeFileId, setActiveFileId] = useState<string>(initialSample.files[0]?.id || '');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialSample.id);
  const [config, setConfig] = useState<ConversionConfig>({
    sourceStack: initialSample.sourceStack,
    targetStack: initialSample.targetStack,
    useTypeScript: true,
    architecture: 'standard',
    preserveComments: true,
    stateStrategy: 'auto',
  });

  // Pre-compute conversion so all output views, terminal, and code files are ready immediately!
  const [conversionResult, setConversionResult] = useState<ConversionResult>(() =>
    generateDeterministicConversion(initialSample.files, {
      sourceStack: initialSample.sourceStack,
      targetStack: initialSample.targetStack,
      useTypeScript: true,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'auto',
    })
  );

  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies' | 'config'
  >('editor');

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isEducationalModalOpen, setIsEducationalModalOpen] = useState(false);

  const t = I18N_STRINGS[language];

  // Sync document direction and lang with active language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  // Convert Project Handler (Calls AI on server with fallback)
  const handleConvert = async () => {
    setIsConverting(true);
    setErrorMessage(null);
    const start = Date.now();

    try {
      const response = await fetch('/api/convert-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, config }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: ConversionResult = await response.json();
      data.latencyMs = data.latencyMs || (Date.now() - start);
      setConversionResult(data);
      setActiveView('diff');
    } catch {
      // Seamlessly fallback to client-side AST deterministic engine
      try {
        const fallbackResult = generateDeterministicConversion(files, config);
        fallbackResult.latencyMs = Date.now() - start;
        setConversionResult(fallbackResult);
        setActiveView('diff');
      } catch (fallbackErr: any) {
        setErrorMessage(
          language === 'fa'
            ? 'خطا در تبدیل پروژه. لطفاً ساختار کدهای مبدا را بازبینی کنید.'
            : fallbackErr?.message || 'Failed to transform project codebase.'
        );
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Stack config changes: auto-recompute conversion output
  const handleChangeConfig = (updates: Partial<ConversionConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setConversionResult(generateDeterministicConversion(files, newConfig));
  };

  // Sample Switcher
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_PROJECTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const newConfig: ConversionConfig = {
      ...config,
      sourceStack: sample.sourceStack,
      targetStack: sample.targetStack,
    };

    setSelectedSampleId(sample.id);
    setFiles(sample.files);
    setActiveFileId(sample.files[0]?.id || '');
    setConfig(newConfig);
    setConversionResult(generateDeterministicConversion(sample.files, newConfig));
    setActiveView('editor');
  };

  // Reset to current sample files
  const handleResetFiles = () => {
    const sample = SAMPLE_PROJECTS.find((s) => s.id === selectedSampleId) || SAMPLE_PROJECTS[0];
    setFiles(sample.files);
    setActiveFileId(sample.files[0]?.id || '');
    setConversionResult(generateDeterministicConversion(sample.files, config));
  };

  // File modification
  const handleUpdateContent = (id: string, newContent: string) => {
    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, content: newContent, isModified: true } : f
      );
      setConversionResult(generateDeterministicConversion(updated, config));
      return updated;
    });
  };

  // Add custom file
  const handleCreateFile = (filePath: string, content: string) => {
    const newFile: ProjectFile = {
      id: `file_${Date.now()}`,
      path: filePath,
      content: content || `// ${filePath}\n`,
      language: detectLanguage(filePath),
      isModified: true,
    };
    const updated = [...files, newFile];
    setFiles(updated);
    setActiveFileId(newFile.id);
    setConversionResult(generateDeterministicConversion(updated, config));
    setActiveView('editor');
  };

  // Delete file
  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
    setConversionResult(generateDeterministicConversion(remaining, config));
  };

  // Download single file
  const handleDownloadSingleFile = (file: ConvertedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'converted-file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export full project as ZIP
  const handleExportZip = async () => {
    if (!conversionResult) return;
    const zip = new JSZip();

    for (const file of conversionResult.convertedFiles) {
      const cleanPath = file.path.trim();
      if (
        cleanPath.startsWith('.') ||
        cleanPath.includes('node_modules') ||
        cleanPath.endsWith('.png') ||
        cleanPath.endsWith('.jpg') ||
        cleanPath.endsWith('.log')
      ) {
        continue;
      }
      zip.file(cleanPath, file.content);
    }

    const migrationGuide = `# Project Migration Report: Code Converter Pro v4.0
Source Stack: ${config.sourceStack}
Target Stack: ${conversionResult.targetStack}
Monorepo Layout: ${conversionResult.recommendedTargetStructure.isMonorepo ? 'Yes' : 'No'}
Engine: ${conversionResult.engine || 'Gemini 3.8 Flash'}

## 1. Project Analysis
${conversionResult.projectAnalysis.sourceSummary}

### Key Architectural Decisions
${conversionResult.projectAnalysis.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 2. Recommended Target Structure
\`\`\`
${conversionResult.recommendedTargetStructure.treeDescription}
\`\`\`

## 3. Dependency Updates
${
  conversionResult.dependencyUpdates.packageJson?.add
    ? `### Packages Added:\n${Object.entries(conversionResult.dependencyUpdates.packageJson.add)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}`
    : ''
}

### Migration Gotchas
${conversionResult.migrationNotes.map((n) => `- ${n}`).join('\n')}
`;

    zip.file('MIGRATION_GUIDE.md', migrationGuide);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codebase-${config.targetStack}-converted.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. Header with iPhone safe area & responsive actions */}
      <Header
        onConvert={handleConvert}
        isConverting={isConverting}
        onExportZip={handleExportZip}
        hasConvertedResult={true}
        activeView={activeView}
        setActiveView={setActiveView}
        fileCount={files.length}
        engine={conversionResult.engine}
        latencyMs={conversionResult.latencyMs}
        language={language}
        onToggleLanguage={toggleLanguage}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenGuide={() => setIsEducationalModalOpen(true)}
      />

      {/* 2. Interactive Action Subtitle Alert & News Ticker */}
      <ActionAlertSubtitle
        language={language}
        onSelectSample={handleSelectSample}
        onOpenGuide={() => setIsEducationalModalOpen(true)}
        onConvert={handleConvert}
        onToggleLayout={() =>
          handleChangeConfig({
            architecture: config.architecture === 'monorepo' ? 'standard' : 'monorepo',
          })
        }
      />

      {/* 3. Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleConvert}
            className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-bold transition-colors active:scale-95"
          >
            {language === 'fa' ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      )}

      {/* 4. Desktop Stack Config Toolbar (Hidden on mobile to avoid duplicate stacked toolbars) */}
      <div className="hidden md:block">
        <StackConfigBar
          config={config}
          onChangeConfig={handleChangeConfig}
          onSelectSample={handleSelectSample}
          selectedSampleId={selectedSampleId}
          language={language}
        />
      </div>

      {/* 5. Central Workbench */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Source Project Tree (Desktop Sidebar & Mobile Drawer) */}
        <ProjectFileTree
          files={files}
          selectedFileId={activeFileId}
          onSelectFile={(id) => {
            setActiveFileId(id);
            setActiveView('editor');
          }}
          onAddFileClick={() => setIsNewFileModalOpen(true)}
          onDeleteFile={handleDeleteFile}
          onResetFiles={handleResetFiles}
          language={language}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />

        {/* Central Display Pane */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
          {/* Tab 1: Source Editor */}
          {activeView === 'editor' && (
            <CodeEditor
              files={files}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              onUpdateContent={handleUpdateContent}
              language={language}
            />
          )}

          {/* Tab 2: Final Converted Output & Diff (Always Ready!) */}
          {activeView === 'diff' && (
            <DiffViewer
              convertedFiles={conversionResult.convertedFiles}
              sourceFiles={files}
              onDownloadFile={handleDownloadSingleFile}
              onExportZip={handleExportZip}
              language={language}
            />
          )}

          {/* Tab 3: Terminal & Package Dependencies Suite */}
          {activeView === 'dependencies' && (
            <DependenciesView
              updates={conversionResult.dependencyUpdates}
              migrationNotes={conversionResult.migrationNotes}
              migrationNotesFa={conversionResult.migrationNotesFa}
              targetStack={conversionResult.targetStack}
              language={language}
            />
          )}

          {/* Tab 4: Project Architecture Analysis */}
          {activeView === 'analysis' && (
            <ProjectAnalysisView
              analysis={conversionResult.projectAnalysis}
              language={language}
            />
          )}

          {/* Tab 5: Monorepo Target Structure */}
          {activeView === 'structure' && (
            <TargetStructureView
              structure={conversionResult.recommendedTargetStructure}
              language={language}
            />
          )}

          {/* Tab 6: Mobile Dedicated Config Settings Screen */}
          {activeView === 'config' && (
            <div className="md:hidden flex-1 p-4 overflow-y-auto space-y-4 pb-20">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">{t.navConfig}</h3>
                  </div>
                  <button
                    onClick={() => setActiveView('diff')}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-sky-400 hover:text-white bg-sky-950 border border-sky-800/80 rounded-lg active:scale-95"
                  >
                    <span>{t.navDiff}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>

                <StackConfigBar
                  config={config}
                  onChangeConfig={handleChangeConfig}
                  onSelectSample={handleSelectSample}
                  selectedSampleId={selectedSampleId}
                  language={language}
                />
              </div>

              {/* Quick Action Navigation Cards on Mobile Config */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveView('diff')}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center active:scale-95 transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">{t.finalCodeTab}</span>
                  <span className="text-[10px] text-slate-400">
                    {language === 'fa' ? 'مشاهده کدهای مقصد' : 'View target code'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveView('dependencies')}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center active:scale-95 transition-transform"
                >
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">{t.navDependencies}</span>
                  <span className="text-[10px] text-slate-400">
                    {language === 'fa' ? 'ترمینال و دستورات CLI' : 'Terminal & CLI commands'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 6. Fixed iOS Bottom Tab Bar (Natural Thumb Reach Zone for iPhone) */}
      <MobileTabBar
        activeView={activeView}
        setActiveView={setActiveView}
        hasConvertedResult={true}
        language={language}
      />

      {/* 7. New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreateFile={handleCreateFile}
        language={language}
      />

      {/* 8. Educational & Migration Knowledge Base Modal */}
      <EducationalModal
        isOpen={isEducationalModalOpen}
        onClose={() => setIsEducationalModalOpen(false)}
        language={language}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
