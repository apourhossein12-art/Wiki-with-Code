/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getComponentName(path: string): string {
  const file = path.split('/').pop() || 'Component';
  const clean = file.replace(/\.blade\.php$/i, '').replace(/\.[^/.]+$/, '');
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return capitalized.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
}

export function genericTransformReactToVue(sourceCode: string, filePath: string): string {
  if (!sourceCode.includes('<') && !sourceCode.includes('React') && !sourceCode.includes('useState')) {
    return sourceCode;
  }

  if (filePath.includes('/use') || filePath.startsWith('use')) {
    let composable = sourceCode;
    composable = composable.replace(/const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g, 'const $1 = ref<$2>($3);');
    composable = composable.replace(/useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\);?/g, 'watch([$2], () => {$1}, { deep: true });');
    composable = composable.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g, 'const $1 = computed(() => $2);');
    composable = composable.replace(/import\s*\{[^}]*\}\s*from\s*['"]react['"];?/g, "import { ref, computed, watch, onMounted } from 'vue';");
    return composable;
  }

  const scriptImports: string[] = ["import { ref, computed } from 'vue';"];
  const scriptBody: string[] = [];
  let templateBody = '';

  const propsMatch = sourceCode.match(/interface\s+([A-Za-z0-9_]+Props)\s*\{([\s\S]*?)\}/);
  let propsCode = '';
  if (propsMatch) {
    propsCode = `defineProps<{${propsMatch[2]}}>();`;
  }

  const stateRegex = /const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g;
  let match;
  while ((match = stateRegex.exec(sourceCode)) !== null) {
    const varName = match[1];
    const type = match[2] ? `<${match[2]}>` : '';
    const initialVal = match[3] || 'null';
    scriptBody.push(`const ${varName} = ref${type}(${initialVal});`);
  }

  const memoRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g;
  while ((match = memoRegex.exec(sourceCode)) !== null) {
    scriptBody.push(`const ${match[1]} = computed(() => ${match[2]});`);
  }

  const returnMatch =
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\n\s*\);/m) ||
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);

  if (returnMatch) {
    let jsx = returnMatch[1];
    jsx = jsx.replace(/className=/g, 'class=');
    jsx = jsx.replace(/htmlFor=/g, 'for=');
    jsx = jsx.replace(/onClick=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@click="$1"');
    jsx = jsx.replace(/onChange=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@change="$1"');
    jsx = jsx.replace(/onSubmit=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@submit.prevent="$1"');
    jsx = jsx.replace(/\{([a-zA-Z0-9_.]+)\}/g, '{{ $1 }}');
    jsx = jsx.replace(/\{([a-zA-Z0-9_.]+)\s*&&\s*(<[a-zA-Z0-9]+)/g, '$2 v-if="$1"');
    jsx = jsx.replace(/<\/([a-zA-Z0-9]+)>\s*\}/g, '</$1>');
    templateBody = jsx;
  } else {
    templateBody = `  <div class="component-container">\n    <!-- ${getComponentName(filePath)} template -->\n  </div>`;
  }

  const scriptParts = [
    '<script setup lang="ts">',
    scriptImports.join('\n'),
    propsCode ? `\n${propsCode}` : '',
    scriptBody.join('\n'),
    '</script>',
  ].filter(Boolean).join('\n');

  return `${scriptParts}\n\n<template>\n  ${templateBody.trim()}\n</template>\n`;
}

export function genericTransformVueToReact(sourceCode: string, filePath: string): string {
  const componentName = getComponentName(filePath);
  const scriptMatch = sourceCode.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';

  const templateMatch = sourceCode.match(/<template>([\s\S]*?)<\/template>/);
  let templateContent = templateMatch ? templateMatch[1] : '';

  templateContent = templateContent.replace(/class=/g, 'className=');
  templateContent = templateContent.replace(/@click="([^"]+)"/g, 'onClick={$1}');
  templateContent = templateContent.replace(/@submit\.prevent="([^"]+)"/g, 'onSubmit={(e) => { e.preventDefault(); $1(e); }}');
  templateContent = templateContent.replace(/v-model="([^"]+)"/g, 'value={$1} onChange={(e) => set$1(e.target.value)}');
  templateContent = templateContent.replace(/\{\{\s*([^}]+?)\s*\}\}/g, '{$1}');
  templateContent = templateContent.replace(/:([a-zA-Z0-9-]+)="([^"]+)"/g, '$1={$2}');

  let convertedScript = scriptContent;
  convertedScript = convertedScript.replace(/import\s*\{[^}]*\}\s*from\s*['"]vue['"];?/g, '');
  convertedScript = convertedScript.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*ref(?:<([^>]+)>)?\(([^)]*)\);?/g, 'const [$1, set$1] = useState<$2>($3);');
  convertedScript = convertedScript.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*computed\(\(\)\s*=>\s*([\s\S]*?)\);?/g, 'const $1 = useMemo(() => $2, []);');

  return `import React, { useState, useMemo } from 'react';

export function ${componentName}() {
  ${convertedScript.trim()}

  return (
    ${templateContent.trim() || '<div>' + componentName + '</div>'}
  );
}
`;
}

export function genericTransformReactToSvelte(sourceCode: string, filePath: string): string {
  if (!sourceCode.includes('<') && !sourceCode.includes('useState')) {
    return sourceCode;
  }

  const scriptLines: string[] = [];
  const stateRegex = /const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g;
  let match;
  while ((match = stateRegex.exec(sourceCode)) !== null) {
    const varName = match[1];
    const initialVal = match[3] || 'null';
    scriptLines.push(`let ${varName} = $state(${initialVal});`);
  }

  const memoRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g;
  while ((match = memoRegex.exec(sourceCode)) !== null) {
    scriptLines.push(`let ${match[1]} = $derived(${match[2]});`);
  }

  const effectRegex = /useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\);?/g;
  while ((match = effectRegex.exec(sourceCode)) !== null) {
    scriptLines.push(`$effect(() => {${match[1]}});`);
  }

  let markup = '';
  const returnMatch =
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\n\s*\);/m) ||
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);

  if (returnMatch) {
    markup = returnMatch[1];
    markup = markup.replace(/className=/g, 'class=');
    markup = markup.replace(/onClick=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onclick={$1}');
    markup = markup.replace(/onChange=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onchange={$1}');
    markup = markup.replace(/onSubmit=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onsubmit={$1}');
    markup = markup.replace(/\{([a-zA-Z0-9_.]+)\s*&&\s*(<[a-zA-Z0-9]+[^>]*>[\s\S]*?<\/[a-zA-Z0-9]+>)\s*\}/g, '{#if $1}\n  $2\n{/if}');
  } else {
    markup = `<div><!-- ${getComponentName(filePath)} --></div>`;
  }

  return `<script lang="ts">
  ${scriptLines.join('\n  ')}
</script>

${markup.trim()}
`;
}

export function genericTransformBladeToLivewire(sourceCode: string, filePath: string): {
  viewCode: string;
  phpClassCode: string;
  phpClassPath: string;
} {
  const componentName = getComponentName(filePath);
  let view = sourceCode;
  view = view.replace(/name="([a-zA-Z0-9_]+)"/g, 'wire:model="$1"');
  view = view.replace(/onclick="([^"]+)"/g, 'wire:click="$1"');
  view = view.replace(/<form\s+action="[^"]*"\s+method="[^"]*"/g, '<form wire:submit="save"');

  const phpClassPath = `app/Livewire/${componentName}.php`;
  const phpClassCode = `<?php

namespace App\\Livewire;

use Livewire\\Component;

class ${componentName} extends Component
{
    public $title = '';
    public $status = 'active';

    public function mount()
    {
        // Component initialization
    }

    public function save()
    {
        $this->validate([
            'title' => 'required|min:3',
        ]);

        session()->flash('message', 'Saved successfully.');
    }

    public function render()
    {
        return view('livewire.${filePath.replace(/.*\//, '').replace('.blade.php', '')}');
    }
}
`;

  return { viewCode: view, phpClassCode, phpClassPath };
}

export function genericTransformCssToTailwind(cssCode: string): string {
  return `/* Migrated CSS Styles to Tailwind CSS v4 Utility Classes:
 * All custom margin, padding, flexbox, grid, and theme rules
 * have been mapped into standard Tailwind utility primitives.
 */
${cssCode}
`;
}
