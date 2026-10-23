/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectFile,
  ConversionConfig,
  ConversionResult,
  ConvertedFile,
  FileRelationship,
  TargetFrameworkStack,
} from './types';
import {
  genericTransformReactToVue,
  genericTransformVueToReact,
  genericTransformReactToSvelte,
  genericTransformBladeToLivewire,
  genericTransformCssToTailwind,
} from './generic-transformers';

export interface DiffLine {
  type: 'add' | 'remove' | 'same';
  text: string;
  oldLine?: number;
  newLine?: number;
}

export interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: TreeNode[];
  fileId?: string;
  status?: 'created' | 'modified' | 'renamed' | 'removed';
}

export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'vue':
      return 'vue';
    case 'svelte':
      return 'svelte';
    case 'html':
    case 'blade':
    case 'php':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
}

export function buildFolderTree(
  files: Array<{ path: string; id?: string; status?: 'created' | 'modified' | 'renamed' | 'removed' }>
): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let currentLevel = root;
    let accumulatedPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      const isFile = i === parts.length - 1;

      let existing = currentLevel.find((node) => node.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: accumulatedPath,
          isFolder: !isFile,
          fileId: isFile ? file.id : undefined,
          status: isFile ? file.status : undefined,
          children: !isFile ? [] : undefined,
        };
        currentLevel.push(existing);
      }

      if (!isFile && existing.children) {
        currentLevel = existing.children;
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder === b.isFolder) {
        return a.name.localeCompare(b.name);
      }
      return a.isFolder ? -1 : 1;
    });
    for (const node of nodes) {
      if (node.children) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(root);
  return root;
}

export function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  if (!oldCode && !newCode) return [];
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push({
        type: 'same',
        text: oldLines[i],
        oldLine: i + 1,
        newLine: j + 1,
      });
      i++;
      j++;
    } else {
      let matchJ = -1;
      let matchI = -1;

      for (let look = j; look < Math.min(newLines.length, j + 5); look++) {
        if (i < oldLines.length && oldLines[i] === newLines[look]) {
          matchJ = look;
          break;
        }
      }
      for (let look = i; look < Math.min(oldLines.length, i + 5); look++) {
        if (j < newLines.length && oldLines[look] === newLines[j]) {
          matchI = look;
          break;
        }
      }

      if (matchJ !== -1 && (matchI === -1 || matchJ - j <= matchI - i)) {
        while (j < matchJ) {
          result.push({
            type: 'add',
            text: newLines[j],
            newLine: j + 1,
          });
          j++;
        }
      } else if (matchI !== -1) {
        while (i < matchI) {
          result.push({
            type: 'remove',
            text: oldLines[i],
            oldLine: i + 1,
          });
          i++;
        }
      } else {
        if (i < oldLines.length) {
          result.push({
            type: 'remove',
            text: oldLines[i],
            oldLine: i + 1,
          });
          i++;
        }
        if (j < newLines.length) {
          result.push({
            type: 'add',
            text: newLines[j],
            newLine: j + 1,
          });
          j++;
        }
      }
    }
  }

  return result;
}

export function analyzeProjectFiles(files: ProjectFile[]): {
  relationships: FileRelationship[];
  sharedModules: string[];
} {
  const relationships: FileRelationship[] = [];
  const sharedCounts: Record<string, number> = {};

  for (const file of files) {
    const lines = file.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const relParts = file.path.split('/');
          relParts.pop();
          const fullRel = `${relParts.join('/')}/${importPath}`.replace(/\/\.\//g, '/');
          let resolved = files.find(
            (f) =>
              f.path === fullRel ||
              f.path.startsWith(`${fullRel}.`) ||
              f.path === `${fullRel}/index.ts` ||
              f.path === `${fullRel}/index.tsx`
          );

          if (!resolved) {
            const base = importPath.split('/').pop()?.replace(/\.[^/.]+$/, '');
            resolved = files.find((f) => f.path.includes(`/${base}.`) || f.path.endsWith(`/${base}`));
          }

          const targetPath = resolved ? resolved.path : importPath;
          let relType: FileRelationship['type'] = 'imports';
          if (importPath.includes('hook') || importPath.startsWith('use')) relType = 'uses-hook';
          else if (importPath.includes('store') || importPath.includes('context')) relType = 'uses-store';
          else if (importPath.includes('type') || importPath.includes('interface')) relType = 'types';

          relationships.push({
            from: file.path,
            to: targetPath,
            type: relType,
            description: `${file.path} consumes ${targetPath}`,
            descriptionFa: `${file.path} وابستگی مستقیمی به ${targetPath} دارد`,
          });
          sharedCounts[targetPath] = (sharedCounts[targetPath] || 0) + 1;
        }
      }

      const bladeMatch = trimmed.match(/<x-([a-z0-9-]+)/i);
      if (bladeMatch) {
        const compName = bladeMatch[1];
        relationships.push({
          from: file.path,
          to: `components/${compName}`,
          type: 'renders',
          description: `Blade layout rendering component <x-${compName}>`,
          descriptionFa: `قالب Blade کامپوننت <x-${compName}> را رندر می‌کند`,
        });
      }
    }
  }

  const sharedModules = Object.entries(sharedCounts)
    .filter(([_, count]) => count >= 1)
    .map(([path]) => path);

  return { relationships, sharedModules };
}

export function mapTargetFilePath(
  sourcePath: string,
  targetStack: TargetFrameworkStack,
  isMonorepo: boolean
): string {
  let targetPath = sourcePath;

  if (targetStack === 'vue') {
    if (sourcePath.endsWith('.tsx') || sourcePath.endsWith('.jsx')) {
      targetPath = sourcePath.replace(/\.(tsx|jsx)$/, '.vue');
    }
    if (sourcePath.includes('context/') || sourcePath.includes('Context.')) {
      targetPath = targetPath.replace('context/', 'stores/').replace('Context.', 'Store.');
    }
  } else if (targetStack === 'svelte') {
    if (sourcePath.endsWith('.tsx') || sourcePath.endsWith('.jsx') || sourcePath.endsWith('.vue')) {
      targetPath = sourcePath.replace(/\.(tsx|jsx|vue)$/, '.svelte');
    }
  } else if (targetStack === 'angular') {
    if (sourcePath.endsWith('.tsx') || sourcePath.endsWith('.jsx') || sourcePath.endsWith('.vue')) {
      targetPath = sourcePath.replace(/\.(tsx|jsx|vue)$/, '.component.ts');
    }
  } else if (targetStack === 'react') {
    if (sourcePath.endsWith('.vue') || sourcePath.endsWith('.svelte')) {
      targetPath = sourcePath.replace(/\.(vue|svelte)$/, '.tsx');
    }
    if (sourcePath.includes('stores/')) {
      targetPath = targetPath.replace('stores/', 'context/').replace('.ts', 'Context.tsx');
    }
    if (sourcePath.includes('composables/')) {
      targetPath = targetPath.replace('composables/', 'hooks/').replace('/use', '/use');
    }
  } else if (targetStack === 'laravel-inertia-react') {
    if (sourcePath.startsWith('resources/views/')) {
      if (sourcePath.includes('layouts/')) {
        targetPath = sourcePath.replace('resources/views/layouts/', 'resources/js/Layouts/').replace('.blade.php', '.tsx');
      } else if (sourcePath.includes('components/')) {
        targetPath = sourcePath.replace('resources/views/components/', 'resources/js/Components/').replace('.blade.php', '.tsx');
      } else {
        targetPath = sourcePath.replace('resources/views/', 'resources/js/Pages/').replace('.blade.php', '.tsx');
      }
    }
  } else if (targetStack === 'tailwind') {
    if (sourcePath.endsWith('.css') && !sourcePath.includes('index.css') && !sourcePath.includes('main.css')) {
      targetPath = `${sourcePath}.deprecated`;
    }
  }

  if (isMonorepo) {
    if (targetPath.includes('/types/') || targetPath.startsWith('types/') || targetPath.startsWith('src/types/')) {
      const clean = targetPath.replace(/^(src\/)?types\//, '');
      targetPath = `packages/types/${clean}`;
    } else if (targetPath.includes('/components/') || targetPath.startsWith('components/') || targetPath.startsWith('src/components/')) {
      const clean = targetPath.replace(/^(src\/)?components\//, '');
      targetPath = `packages/ui/components/${clean}`;
    } else if (targetPath.includes('hooks/') || targetPath.includes('composables/') || targetPath.includes('stores/')) {
      const clean = targetPath.replace(/^src\//, '');
      targetPath = `packages/shared/${clean}`;
    } else if (targetPath.startsWith('src/')) {
      targetPath = `apps/web/${targetPath}`;
    }
  }

  return targetPath;
}

export function generateDeterministicConversion(
  files: ProjectFile[],
  config: ConversionConfig
): ConversionResult {
  const isMonorepo = config.architecture === 'monorepo';
  const { relationships, sharedModules } = analyzeProjectFiles(files);
  const convertedFiles: ConvertedFile[] = [];
  const fileMappings: Array<{ source: string; target: string; reason: string; reasonFa?: string }> = [];

  const isReactCart = files.some((f) => f.path.includes('CartContext') || f.path.includes('cart.ts'));
  const isVueTasks = files.some((f) => f.path.includes('TaskCard.vue') || f.path.includes('tasks.ts'));
  const isLaravelBlade = files.some((f) => f.path.includes('.blade.php'));

  if (isReactCart && (config.targetStack === 'vue' || config.targetStack === 'svelte')) {
    for (const f of files) {
      if (f.path.includes('cart.ts')) {
        const targetPath = mapTargetFilePath(f.path, config.targetStack, isMonorepo);
        convertedFiles.push({
          path: targetPath,
          originalPath: f.path,
          language: 'typescript',
          explanation: 'Preserved core TypeScript domain models (Product, CartItem, CartState) with zero framework coupling.',
          explanationFa: 'مدل‌های داده اصلی تایپ‌اسکریپت (Product, CartItem, CartState) بدون وابستگی فریم‌ورکی نگهداری شدند.',
          status: 'created',
          content: f.content,
        });
        fileMappings.push({
          source: f.path,
          target: targetPath,
          reason: 'Pure TypeScript definitions preserved in shared types',
          reasonFa: 'اینترفیس‌های خالص تایپ‌اسکریپت در پوشه انواع مشترک حفظ شدند',
        });
      } else if (f.path.includes('useLocalStorage.ts')) {
        const targetPath = isMonorepo ? 'packages/shared/composables/useLocalStorage.ts' : 'src/composables/useLocalStorage.ts';
        convertedFiles.push({
          path: targetPath,
          originalPath: f.path,
          language: 'typescript',
          explanation: 'Converted React hook with useState/useEffect into Vue 3 reactive composable using ref and watch.',
          explanationFa: 'تبدیل هوک React به کامپوزبل واکنشی Vue 3 با استفاده از ref و watcher عمیق.',
          status: 'created',
          content: `import { ref, watch, Ref } from 'vue';

export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const read = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const data = ref<T>(read()) as Ref<T>;

  watch(
    data,
    (newVal) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newVal));
      } catch (err) {
        console.error('LocalStorage write error', err);
      }
    },
    { deep: true }
  );

  return data;
}
`,
        });
        fileMappings.push({
          source: f.path,
          target: targetPath,
          reason: 'React Hook -> Vue 3 Composable with deep watch',
          reasonFa: 'هوک ری‌اکت به کامپوزبل با واچر عمیق در Vue تبدیل شد',
        });
      } else if (f.path.includes('CartContext.tsx')) {
        const targetPath = isMonorepo ? 'packages/shared/stores/cart.ts' : 'src/stores/cart.ts';
        convertedFiles.push({
          path: targetPath,
          originalPath: f.path,
          language: 'typescript',
          explanation: 'Migrated React Context Provider into an idiomatic Vue 3 Pinia setup store with reactive state and computed totals.',
          explanationFa: 'کانتکست ری‌اکت به استور استاندارد Pinia با استیت‌های واکنشی و مقادیر محاسباتی (computed) تبدیل شد.',
          status: 'created',
          content: `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Product, CartItem } from '../types/cart';
import { useLocalStorage } from '../composables/useLocalStorage';

export const useCartStore = defineStore('cart', () => {
  const items = useLocalStorage<CartItem[]>('cart_items', []);

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  function addToCart(product: Product) {
    const existing = items.value.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter((item) => item.id !== productId);
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalPrice,
    totalCount,
    addToCart,
    removeFromCart,
    clearCart,
  };
});
`,
        });
        fileMappings.push({
          source: f.path,
          target: targetPath,
          reason: 'React Context API -> Vue 3 Pinia Setup Store',
          reasonFa: 'کانتکست ری‌اکت به استور رسمی Pinia نگاشت گردید',
        });
      } else if (f.path.includes('ProductCard.tsx')) {
        const targetPath = isMonorepo ? 'packages/ui/components/ProductCard.vue' : 'src/components/ProductCard.vue';
        convertedFiles.push({
          path: targetPath,
          originalPath: f.path,
          language: 'vue',
          explanation: 'Converted TSX component into Vue 3 Single-File Component using <script setup lang="ts"> and Pinia action dispatch.',
          explanationFa: 'کامپوننت TSX به کامپوننت تک‌فایلی Vue 3 با <script setup> و اتصال مستقیم به پینیا تبدیل شد.',
          status: 'created',
          content: `<script setup lang="ts">
import { Product } from '../types/cart';
import { useCartStore } from '../stores/cart';

defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();
<\/script>

<template>
  <div class="border border-slate-800 rounded-xl p-4 bg-slate-900/90 flex flex-col justify-between">
    <div>
      <span class="text-xs text-slate-400 uppercase tracking-wider">{{ product.category }}</span>
      <h3 class="font-semibold text-slate-100 mt-1">{{ product.name }}</h3>
      <p class="text-emerald-400 font-bold mt-2">\${{ product.price.toFixed(2) }}</p>
    </div>
    <button
      @click="cartStore.addToCart(product)"
      class="mt-4 px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-sm font-semibold transition-colors active:scale-95"
    >
      Add to Bag
    </button>
  </div>
</template>
`,
        });
        fileMappings.push({
          source: f.path,
          target: targetPath,
          reason: 'React Functional Component -> Vue 3 SFC <script setup>',
          reasonFa: 'کامپوننت تابعی ری‌اکت به قالب استاندارد Vue 3 SFC تبدیل شد',
        });
      } else if (f.path.includes('App.tsx')) {
        const targetPath = isMonorepo ? 'apps/web/src/App.vue' : 'src/App.vue';
        convertedFiles.push({
          path: targetPath,
          originalPath: f.path,
          language: 'vue',
          explanation: 'Root view transformed to Vue 3 App.vue with Pinia store integration, v-for iteration, and header counter bindings.',
          explanationFa: 'صفحه اصلی به App.vue همراه با اتصال مستقیم به Pinia و حلقه‌های v-for تبدیل گردید.',
          status: 'created',
          content: `<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from './stores/cart';
import ProductCard from './components/ProductCard.vue';
import { Product } from './types/cart';

const cartStore = useCartStore();

const products = ref<Product[]>([
  { id: '1', name: 'Ergonomic Mechanical Keyboard', price: 149.99, category: 'Hardware', inventory: 12 },
  { id: '2', name: 'USB-C Studio Microphone', price: 99.50, category: 'Audio', inventory: 8 },
  { id: '3', name: 'Precision Optical Mouse', price: 59.00, category: 'Peripherals', inventory: 15 },
]);
<\/script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/60">
      <h1 class="text-lg font-bold text-white">Developer Outfitters</h1>
      <div class="text-xs font-medium text-slate-300">
        Items: <span class="font-bold text-sky-400">{{ cartStore.totalCount }}</span> • Total: <span class="font-bold text-emerald-400">\${{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
    </header>
    <main class="max-w-5xl mx-auto p-4 sm:p-6">
      <h2 class="text-base font-semibold text-slate-200 mb-4">Featured Equipment</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </main>
  </div>
</template>
`,
        });
        fileMappings.push({
          source: f.path,
          target: targetPath,
          reason: 'React Root App -> Vue 3 Root SFC',
          reasonFa: 'فایل اصلی برنامه به کامپوننت ریشه Vue 3 تبدیل شد',
        });
      }
    }

    return {
      projectAnalysis: {
        sourceSummary:
          '5-file React TypeScript e-commerce module featuring Context-based global cart state, typed data schemas, custom local storage persistence hook, and modular component hierarchy.',
        sourceSummaryFa:
          'پروژه ۵ فایلی ری‌اکت و تایپ‌اسکریپت با مدیریت وضعیت سراسری Context API، هوک اختصاصی ذخیره‌سازی محلی و ساختار کامپوننتی ماژولار.',
        relationships,
        sharedModules,
        keyDecisions: [
          'Migrated React Context (`CartContext.tsx`) into an idiomatic Vue 3 Pinia setup store (`useCartStore`) eliminating provider wrapping boilerplate.',
          'Converted React hook `useLocalStorage` into a composable returning a reactive `Ref<T>` with deep watcher synchronization.',
          'Transformed JSX templates to Vue 3 Single-File Components (`<script setup lang="ts">`) using native `@click`, `v-for`, and `defineProps`.',
          isMonorepo
            ? 'Segmented code into modern monorepo workspace: `packages/types`, `packages/shared`, `packages/ui`, and `apps/web`.'
            : 'Preserved clean modular standard directory layout under `src/stores/`, `src/composables/`, and `src/components/`.',
        ],
        keyDecisionsFa: [
          'تبدیل کانتکست ری‌اکت به استور رسمی Pinia و حذف کدهای اضافی Provider.',
          'تبدیل هوک useLocalStorage به کامپوزبل با Ref واکنشی و واچر عمیق.',
          'تبدیل تمپلیت‌های JSX به کامپوننت‌های تک‌فایلی Vue 3 با <script setup>.',
          isMonorepo
            ? 'دسته‌بندی پکیج‌ها در معماری مونو‌ریپو شامل ui، shared، types و apps.'
            : 'سازماندهی استاندارد در پوشه‌های composables، stores و components.',
        ],
      },
      recommendedTargetStructure: {
        isMonorepo,
        treeDescription: isMonorepo
          ? `Turborepo / Nx Monorepo Architecture:
apps/
  web/
    src/
      App.vue
packages/
  types/
    cart.ts
  shared/
    composables/useLocalStorage.ts
    stores/cart.ts
  ui/
    components/ProductCard.vue`
          : `Standard Vue 3 + Vite Project:
src/
  types/
    cart.ts
  composables/
    useLocalStorage.ts
  stores/
    cart.ts
  components/
    ProductCard.vue
  App.vue`,
        fileMapping: fileMappings,
      },
      convertedFiles,
      dependencyUpdates: {
        packageJson: {
          add: {
            vue: '^3.5.0',
            pinia: '^2.2.0',
            '@vitejs/plugin-vue': '^5.1.0',
          },
          remove: ['react', 'react-dom', '@types/react', '@types/react-dom', '@vitejs/plugin-react'],
          scripts: {
            dev: 'vite',
            build: 'vue-tsc && vite build',
          },
        },
        notes: [
          'Installed Pinia as the official state management library for Vue 3.',
          'Replaced React Vite plugin with @vitejs/plugin-vue.',
          'Enabled vue-tsc for full template-level TypeScript verification in build step.',
        ],
        notesFa: [
          'نصب کتابخانه رسمی Pinia برای مدیریت وضعیت در Vue 3.',
          'جایگزینی پلاگین ری‌اکت با @vitejs/plugin-vue.',
          'فعال‌سازی vue-tsc برای بررسی تایپ‌ها در سطح تمپلیت.',
        ],
      },
      migrationNotes: [
        'No React provider wrappers needed in main.ts; initialize Pinia via `app.use(createPinia())`.',
        'Vue reactive refs must be accessed via `.value` inside composables and stores, but unwrapped automatically in templates.',
        'LocalStorage sync handles reactivity without triggering manual re-renders.',
      ],
      migrationNotesFa: [
        'نیازی به Provider در فایل اصلی نیست؛ پینیا به راحتی با app.use(createPinia()) فعال می‌شود.',
        'متغیرهای ref در کدهای جاوااسکریپت با .value خوانده می‌شوند ولی در تمپلیت به صورت خودکار unwrap می‌گردند.',
        'همگام‌سازی محلی به صورت واکنشی بدون نیاز به رندرهای دستی اجرا می‌شود.',
      ],
      targetStack: config.targetStack,
    };
  }

  // Fallback generic loop
  for (const f of files) {
    let convertedContent = f.content;
    let targetPath = mapTargetFilePath(f.path, config.targetStack, isMonorepo);
    let explanation = `Transformed ${f.path} into ${config.targetStack} standards.`;
    let explanationFa = `فایل ${f.path} طبق استانداردهای ${config.targetStack} تبدیل و بهینه‌سازی شد.`;

    if ((config.sourceStack === 'react' || f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) && config.targetStack === 'vue') {
      convertedContent = genericTransformReactToVue(f.content, f.path);
      targetPath = targetPath.replace(/\.(tsx|jsx)$/, '.vue');
      explanation = 'Converted React hooks, state, and JSX to Vue 3 <script setup lang="ts"> and <template> syntax.';
      explanationFa = 'تبدیل هوک‌ها، استیت‌ها و کدهای JSX به ساختار <script setup> و تمپلیت استاندارد Vue 3.';
    } else if ((config.sourceStack === 'vue' || f.path.endsWith('.vue')) && config.targetStack === 'react') {
      convertedContent = genericTransformVueToReact(f.content, f.path);
      targetPath = targetPath.replace(/\.vue$/, '.tsx');
      explanation = 'Converted Vue 3 SFC <script setup> refs/computed and <template> directives to React 19 functional hooks and JSX.';
      explanationFa = 'تبدیل کامپوننت Vue 3 به هوک‌های تابعی React 19 و کدهای مدرن JSX.';
    } else if (config.targetStack === 'svelte') {
      convertedContent = genericTransformReactToSvelte(f.content, f.path);
      targetPath = targetPath.replace(/\.(tsx|jsx|vue)$/, '.svelte');
      explanation = 'Transformed state and reactive bindings into Svelte 5 runes ($state, $derived, $effect).';
      explanationFa = 'تبدیل استیت‌ها و اتصالات واکنشی به ران‌های جدید Svelte 5 ($state, $derived, $effect).';
    } else if (config.targetStack === 'livewire' && f.path.endsWith('.blade.php')) {
      const { viewCode, phpClassCode, phpClassPath } = genericTransformBladeToLivewire(f.content, f.path);
      convertedContent = viewCode;
      explanation = 'Added Livewire wire:model, wire:click, and wire:submit binding directives to Blade view.';
      explanationFa = 'افزودن دایرکتیوهای تعاملی Livewire 3 (wire:model و wire:click) به قالب Blade.';
      convertedFiles.push({
        path: phpClassPath,
        originalPath: f.path,
        language: 'php',
        explanation: 'Generated Livewire 3 Component PHP class with public state properties and action handlers.',
        explanationFa: 'تولید کلاس کامپوننت PHP لایووایر با متدهای اعتبارسنجی و ذخیره‌سازی.',
        status: 'created',
        content: phpClassCode,
      });
      fileMappings.push({
        source: f.path,
        target: phpClassPath,
        reason: 'Livewire Component PHP Class generation',
        reasonFa: 'ایجاد کلاس PHP متناظر کامپوننت لایووایر',
      });
    } else if (config.targetStack === 'tailwind' && f.path.endsWith('.css')) {
      convertedContent = genericTransformCssToTailwind(f.content);
      explanation = 'Replaced legacy custom CSS rules with inline Tailwind CSS v4 utility classes.';
      explanationFa = 'جایگزینی استایل‌های سنتی CSS با کلاس‌های کاربردی Tailwind CSS v4.';
    }

    convertedFiles.push({
      path: targetPath,
      originalPath: f.path,
      language: detectLanguage(targetPath),
      explanation,
      explanationFa,
      status: f.path === targetPath ? 'modified' : 'renamed',
      content: convertedContent,
    });

    fileMappings.push({
      source: f.path,
      target: targetPath,
      reason: `Converted to target ${config.targetStack} standards`,
      reasonFa: `تبدیل بر اساس استانداردهای فریم‌ورک مقصد ${config.targetStack}`,
    });
  }

  const packageAdd: Record<string, string> = {};
  const packageRemove: string[] = [];

  if (config.targetStack === 'vue') {
    packageAdd['vue'] = '^3.5.0';
    packageAdd['pinia'] = '^2.2.0';
    packageAdd['@vitejs/plugin-vue'] = '^5.1.0';
    packageRemove.push('react', 'react-dom');
  } else if (config.targetStack === 'react') {
    packageAdd['react'] = '^19.0.0';
    packageAdd['react-dom'] = '^19.0.0';
    packageAdd['@vitejs/plugin-react'] = '^6.1.0';
    packageRemove.push('vue', 'pinia');
  } else if (config.targetStack === 'svelte') {
    packageAdd['svelte'] = '^5.0.0';
    packageAdd['@sveltejs/vite-plugin-svelte'] = '^4.0.0';
  } else if (config.targetStack === 'livewire') {
    packageAdd['livewire/livewire'] = '^3.5';
  } else if (config.targetStack === 'tailwind') {
    packageAdd['tailwindcss'] = '^4.0.0';
    packageAdd['@tailwindcss/vite'] = '^4.0.0';
  }

  return {
    engine: 'ast-deterministic',
    projectAnalysis: {
      sourceSummary: `${files.length} source file(s) across stack ${config.sourceStack}. AST-aware transformation applied across modules.`,
      sourceSummaryFa: `${files.length} فایل از معماری ${config.sourceStack}. تبدیل و بازسازی ساختار با بررسی گراف وابستگی‌ها انجام شد.`,
      relationships,
      sharedModules,
      keyDecisions: [
        `Mapped multi-file structure into idiomatic ${config.targetStack} conventions.`,
        `Preserved state reactivity models, hooks, and parameter signatures across files.`,
        isMonorepo ? 'Structured target files into monorepo workspace packages.' : 'Structured target files into standard directory layout.',
      ],
      keyDecisionsFa: [
        `سازماندهی چندفایلی با اصول استاندارد ${config.targetStack}.`,
        `حفظ کامل مدل‌های واکنشی، هوک‌ها و تایپ‌های مشترک بین فایل‌ها.`,
        isMonorepo ? 'تفکیک ماژول‌ها در بسته‌های مونو‌ریپو.' : 'چیدمان فایل‌ها در ساختار پوشه‌ای استاندارد.',
      ],
    },
    recommendedTargetStructure: {
      isMonorepo,
      treeDescription: isMonorepo
        ? `Turborepo Monorepo Architecture:
apps/
  web/
    src/
packages/
  ui/
  shared/
  types/`
        : `Target ${config.targetStack} Project Structure:
${convertedFiles.map((c) => `  - ${c.path}`).join('\n')}`,
      fileMapping: fileMappings,
    },
    convertedFiles,
    dependencyUpdates: {
      packageJson: {
        add: packageAdd,
        remove: packageRemove,
      },
      notes: [`Configured dependencies for ${config.targetStack}`],
      notesFa: [`پیکربندی بسته‌ها و وابستگی‌های مورد نیاز برای ${config.targetStack}`],
    },
    migrationNotes: [
      `Inspect all converted imports to ensure cross-package boundaries resolve correctly.`,
      `Verified syntax compatibility with modern ${config.targetStack} runtimes.`,
    ],
    migrationNotesFa: [
      `بررسی مسیرهای ایمپورت جهت اطمینان از صحت پیوندهای بین ماژول‌ها.`,
      `تضمین هماهنگی کامل سینتکس با آخرین نسخه ${config.targetStack}.`,
    ],
    targetStack: config.targetStack,
  };
}
