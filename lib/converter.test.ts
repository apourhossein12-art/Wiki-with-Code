/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLanguage,
  buildFolderTree,
  computeDiff,
  mapTargetFilePath,
  analyzeProjectFiles,
  generateDeterministicConversion,
} from './converter-utils';
import { SAMPLE_PROJECTS } from './sample-projects';

test('detectLanguage maps file extensions properly', () => {
  assert.equal(detectLanguage('src/App.tsx'), 'typescript');
  assert.equal(detectLanguage('src/App.vue'), 'vue');
  assert.equal(detectLanguage('src/App.svelte'), 'svelte');
  assert.equal(detectLanguage('src/styles/app.css'), 'css');
  assert.equal(detectLanguage('package.json'), 'json');
  assert.equal(detectLanguage('resources/views/app.blade.php'), 'html');
});

test('buildFolderTree builds hierarchy from paths', () => {
  const files = [
    { path: 'src/types/cart.ts', id: '1' },
    { path: 'src/components/ProductCard.tsx', id: '2' },
  ];
  const tree = buildFolderTree(files);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].name, 'src');
  assert.equal(tree[0].isFolder, true);
  assert.ok(tree[0].children && tree[0].children.length >= 2);
});

test('computeDiff detects additions, deletions, and unchanged lines', () => {
  const oldCode = 'line 1\nline 2';
  const newCode = 'line 1\nline 2 mod\nline 3';
  const diff = computeDiff(oldCode, newCode);
  assert.ok(diff.length >= 3);
  assert.equal(diff[0].type, 'same');
  assert.equal(diff[0].text, 'line 1');
});

test('mapTargetFilePath converts extensions and monorepo packages correctly', () => {
  // Standard Vue
  assert.equal(mapTargetFilePath('src/components/Button.tsx', 'vue', false), 'src/components/Button.vue');
  // Monorepo Vue
  assert.equal(mapTargetFilePath('src/components/Button.tsx', 'vue', true), 'packages/ui/components/Button.vue');
  assert.equal(mapTargetFilePath('src/types/user.ts', 'vue', true), 'packages/types/user.ts');
});

test('generateDeterministicConversion handles React Cart to Vue 3 with bilingual annotations', () => {
  const sample = SAMPLE_PROJECTS[0];
  const result = generateDeterministicConversion(sample.files, {
    sourceStack: 'react',
    targetStack: 'vue',
    useTypeScript: true,
    architecture: 'standard',
    preserveComments: true,
    stateStrategy: 'pinia',
  });

  assert.equal(result.convertedFiles.length, 5);
  assert.ok(result.projectAnalysis.sourceSummaryFa);
  assert.ok(result.projectAnalysis.keyDecisionsFa && result.projectAnalysis.keyDecisionsFa.length >= 3);

  const productCard = result.convertedFiles.find((f) => f.path.includes('ProductCard.vue'));
  assert.ok(productCard);
  assert.ok(productCard?.content.includes('<script setup lang="ts">'));
  assert.ok(productCard?.content.includes('defineProps'));
  assert.ok(productCard?.explanationFa);
});
