/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FrameworkStack =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'solid'
  | 'laravel-blade'
  | 'class-components'
  | 'css';

export type TargetFrameworkStack =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'solid'
  | 'laravel-inertia-react'
  | 'laravel-inertia-vue'
  | 'livewire'
  | 'tailwind';

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  isModified?: boolean;
}

export interface ConversionConfig {
  sourceStack: FrameworkStack;
  targetStack: TargetFrameworkStack;
  useTypeScript: boolean;
  architecture: 'standard' | 'monorepo' | 'feature-sliced';
  preserveComments: boolean;
  stateStrategy: 'auto' | 'pinia' | 'zustand' | 'svelte-runes' | 'signals' | 'context';
}

export interface FileRelationship {
  from: string;
  to: string;
  type: 'imports' | 'uses-hook' | 'uses-store' | 'types' | 'renders';
  description?: string;
  descriptionFa?: string;
}

export interface ConvertedFile {
  path: string;
  originalPath?: string;
  content: string;
  language: string;
  explanation: string;
  explanationFa?: string;
  status: 'created' | 'modified' | 'renamed' | 'removed';
}

export interface FileMapping {
  source: string;
  target: string;
  reason: string;
  reasonFa?: string;
}

export interface DependencyUpdates {
  packageJson?: {
    add?: Record<string, string>;
    remove?: string[];
    scripts?: Record<string, string>;
  };
  composerJson?: {
    add?: Record<string, string>;
    remove?: string[];
  };
  notes: string[];
  notesFa?: string[];
}

export interface ProjectAnalysis {
  sourceSummary: string;
  sourceSummaryFa?: string;
  relationships: FileRelationship[];
  sharedModules: string[];
  keyDecisions: string[];
  keyDecisionsFa?: string[];
}

export interface TargetStructure {
  isMonorepo: boolean;
  treeDescription: string;
  fileMapping: FileMapping[];
  explanation?: string;
  explanationFa?: string;
}

export interface ConversionResult {
  engine?: 'gemini-3.8-flash' | 'ast-deterministic';
  latencyMs?: number;
  projectAnalysis: ProjectAnalysis;
  recommendedTargetStructure: TargetStructure;
  convertedFiles: ConvertedFile[];
  dependencyUpdates: DependencyUpdates;
  migrationNotes: string[];
  migrationNotesFa?: string[];
  convertedAt?: string;
  targetStack: TargetFrameworkStack;
}

export interface SampleProject {
  id: string;
  name: string;
  nameFa: string;
  tagline: string;
  taglineFa: string;
  sourceStack: FrameworkStack;
  targetStack: TargetFrameworkStack;
  description: string;
  descriptionFa: string;
  files: ProjectFile[];
}

export type LanguageMode = 'fa' | 'en';

export interface ActionAlertItem {
  id: string;
  category: 'educational' | 'news' | 'action' | 'tip';
  categoryTitle: { en: string; fa: string };
  title: { en: string; fa: string };
  message: { en: string; fa: string };
  actionLabel?: { en: string; fa: string };
  actionType?: 'convert' | 'sample' | 'guide' | 'monorepo' | 'download';
  sampleId?: string;
}
