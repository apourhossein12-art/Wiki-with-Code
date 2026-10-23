/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SampleProject } from './types';

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'react-cart-auth',
    name: 'React TS: Shopping Cart & Auth',
    nameFa: 'ری‌اکت تایپ‌اسکریپت: سبد خرید و مدیریت هویت',
    tagline: '5 Files • Context API + Custom Hooks + Types',
    taglineFa: '۵ فایل • استیت Context + هوک‌های اختصاصی + تایپ‌ها',
    sourceStack: 'react',
    targetStack: 'vue',
    description:
      'A multi-file React application with Context state, custom persistence hooks, typed interfaces, and shared UI components.',
    descriptionFa:
      'یک پروژه چندفایلی ری‌اکت با کانتکست عمومی، هوک اختصاصی ذخیره‌سازی محلی، اینترفیس‌های تایپ‌شده و کامپوننت‌های مشترک.',
    files: [
      {
        id: 'f1',
        path: 'src/types/cart.ts',
        language: 'typescript',
        content: `export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inventory: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  user: { name: string; email: string } | null;
}
`,
      },
      {
        id: 'f2',
        path: 'src/hooks/useLocalStorage.ts',
        language: 'typescript',
        content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.error('LocalStorage write error', err);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
`,
      },
      {
        id: 'f3',
        path: 'src/context/CartContext.tsx',
        language: 'typescript',
        content: `import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, CartItem, CartState } from '../types/cart';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('cart_items', []);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
`,
      },
      {
        id: 'f4',
        path: 'src/components/ProductCard.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { Product } from '../types/cart';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/90 flex flex-col justify-between">
      <div>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{product.category}</span>
        <h3 className="font-semibold text-slate-100 mt-1">{product.name}</h3>
        <p className="text-emerald-400 font-bold mt-2">\${product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="mt-4 px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-sm font-semibold transition-colors active:scale-95"
      >
        Add to Bag
      </button>
    </div>
  );
};
`,
      },
      {
        id: 'f5',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { ProductCard } from './components/ProductCard';
import { Product } from './types/cart';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Ergonomic Mechanical Keyboard', price: 149.99, category: 'Hardware', inventory: 12 },
  { id: '2', name: 'USB-C Studio Microphone', price: 99.50, category: 'Audio', inventory: 8 },
  { id: '3', name: 'Precision Optical Mouse', price: 59.00, category: 'Peripherals', inventory: 15 },
];

function Header() {
  const { totalCount, totalPrice } = useCart();
  return (
    <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/60">
      <h1 className="text-lg font-bold text-white">Developer Outfitters</h1>
      <div className="text-xs font-medium text-slate-300">
        Items: <span className="font-bold text-sky-400">{totalCount}</span> • Total: <span className="font-bold text-emerald-400">\${totalPrice.toFixed(2)}</span>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Featured Equipment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
`,
      },
    ],
  },
  {
    id: 'vue-pinia-tasks',
    name: 'Vue 3: Pinia Task Manager',
    nameFa: 'ویو ۳: تسک منیجر با پینیا',
    tagline: '4 Files • Pinia Store + Composables + SFC',
    taglineFa: '۴ فایل • استور Pinia + کامپوزبل‌ها + کامپوننت‌های SFC',
    sourceStack: 'vue',
    targetStack: 'react',
    description:
      'Vue 3 Composition API project with Pinia state management, search filters composable, and single-file components.',
    descriptionFa:
      'پروژه چندفایلی Vue 3 با استور واکنشی Pinia، کامپوزبل فیلتر جستجو و کامپوننت‌های تک‌فایلی.',
    files: [
      {
        id: 'v1',
        path: 'src/stores/tasks.ts',
        language: 'typescript',
        content: `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([
    { id: '1', title: 'Implement AST Parser', completed: true, priority: 'high' },
    { id: '2', title: 'Write Vite middleware', completed: false, priority: 'medium' },
    { id: '3', title: 'Design monorepo layout', completed: false, priority: 'high' },
  ]);

  const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);
  const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length);

  function addTask(title: string, priority: Task['priority'] = 'medium') {
    tasks.value.push({
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
    });
  }

  function toggleTask(id: string) {
    const target = tasks.value.find((t) => t.id === id);
    if (target) {
      target.completed = !target.completed;
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter((t) => t.id !== id);
  }

  return { tasks, completedCount, pendingCount, addTask, toggleTask, deleteTask };
});
`,
      },
      {
        id: 'v2',
        path: 'src/composables/useFilter.ts',
        language: 'typescript',
        content: `import { ref, computed, Ref } from 'vue';
import { Task } from '../stores/tasks';

export function useTaskFilter(tasks: Ref<Task[]>) {
  const query = ref('');
  const statusFilter = ref<'all' | 'active' | 'completed'>('all');

  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      const matchesQuery = task.title.toLowerCase().includes(query.value.toLowerCase());
      if (statusFilter.value === 'active') return matchesQuery && !task.completed;
      if (statusFilter.value === 'completed') return matchesQuery && task.completed;
      return matchesQuery;
    });
  });

  return { query, statusFilter, filteredTasks };
}
`,
      },
      {
        id: 'v3',
        path: 'src/components/TaskCard.vue',
        language: 'html',
        content: `<script setup lang="ts">
import { Task } from '../stores/tasks';

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: string): void;
  (e: 'remove', id: string): void;
}>();
<\/script>

<template>
  <div class="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="emit('toggle', task.id)"
        class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-sky-400"
      />
      <span :class="{'line-through text-slate-500': task.completed, 'text-slate-200': !task.completed}">
        {{ task.title }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
        {{ task.priority }}
      </span>
      <button @click="emit('remove', task.id)" class="text-rose-400 hover:text-rose-300 text-xs">
        Delete
      </button>
    </div>
  </div>
</template>
`,
      },
      {
        id: 'v4',
        path: 'src/App.vue',
        language: 'html',
        content: `<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from './stores/tasks';
import { useTaskFilter } from './composables/useFilter';
import TaskCard from './components/TaskCard.vue';

const store = useTaskStore();
const { query, statusFilter, filteredTasks } = useTaskFilter(ref(store.tasks));
const newTitle = ref('');

function handleSubmit() {
  if (!newTitle.value.trim()) return;
  store.addTask(newTitle.value.trim());
  newTitle.value = '';
}
<\/script>

<template>
  <main class="max-w-2xl mx-auto p-4 sm:p-6 font-sans">
    <header class="mb-6 flex justify-between items-center">
      <h1 class="text-xl font-bold text-white">Sprint Tasks</h1>
      <div class="text-xs text-slate-400">
        {{ store.completedCount }} done / {{ store.tasks.length }} total
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="flex gap-2 mb-4">
      <input
        v-model="newTitle"
        placeholder="Add task title..."
        class="flex-1 border border-slate-800 bg-slate-900 rounded-lg px-3 py-2 text-sm text-slate-100"
      />
      <button type="submit" class="bg-sky-500 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold">
        Add
      </button>
    </form>

    <div class="space-y-2">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @toggle="store.toggleTask"
        @remove="store.deleteTask"
      />
    </div>
  </main>
</template>
`,
      },
    ],
  },
  {
    id: 'laravel-blade-dashboard',
    name: 'Laravel Blade: Server Dashboard',
    nameFa: 'لاراول بلید: داشبورد سرور و زیرساخت',
    tagline: '4 Files • Blade Layouts + Components + Web Routes',
    taglineFa: '۴ فایل • قالب‌های Blade + کامپوننت‌ها + روت‌های وب',
    sourceStack: 'laravel-blade',
    targetStack: 'laravel-inertia-react',
    description:
      'Traditional Laravel Blade application with layouts, component directives, and controllers to be transformed into React + Inertia.js.',
    descriptionFa:
      'پروژه یکپارچه Laravel Blade با لی‌اوت، دایرکتیوهای x-component و کنترلر وب جهت تبدیل به React + Inertia.js.',
    files: [
      {
        id: 'l1',
        path: 'resources/views/layouts/app.blade.php',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>@yield('title', 'Cloud Console')</title>
</head>
<body class="bg-slate-950 text-slate-100">
    <nav class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <span class="font-bold text-base text-white">Acme Cloud</span>
        <div class="text-xs text-slate-400">Logged in as {{ Auth::user()->name ?? 'Administrator' }}</div>
    </nav>
    <main class="max-w-6xl mx-auto py-6 px-4">
        @yield('content')
    </main>
</body>
</html>
`,
      },
      {
        id: 'l2',
        path: 'resources/views/components/stat-card.blade.php',
        language: 'html',
        content: `@props(['title', 'value', 'change', 'isPositive' => true])

<div class="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
    <span class="text-xs uppercase font-medium text-slate-400 tracking-wider">{{ $title }}</span>
    <div class="text-2xl font-bold text-white mt-2">{{ $value }}</div>
    <div class="mt-2 text-xs flex items-center {{ $isPositive ? 'text-emerald-400' : 'text-rose-400' }}">
        <span>{{ $change }} vs last month</span>
    </div>
</div>
`,
      },
      {
        id: 'l3',
        path: 'resources/views/dashboard.blade.php',
        language: 'html',
        content: `@extends('layouts.app')

@section('title', 'Server Analytics')

@section('content')
<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold text-white">Infrastructure Overview</h1>
        <button class="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-semibold">
            Deploy Instance
        </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <x-stat-card title="Active Nodes" value="{{ $stats['nodes'] }}" change="+12%" :isPositive="true" />
        <x-stat-card title="CPU Utilization" value="{{ $stats['cpu'] }}%" change="-3.4%" :isPositive="true" />
        <x-stat-card title="Monthly Billing" value="\${{ number_format($stats['billing'], 2) }}" change="+8.1%" :isPositive="false" />
    </div>
</div>
@endsection
`,
      },
      {
        id: 'l4',
        path: 'routes/web.php',
        language: 'php',
        content: `<?php

use Illuminate\\Support\\Facades\\Route;

Route::get('/dashboard', function () {
    return view('dashboard', [
        'stats' => [
            'nodes' => 24,
            'cpu' => 41.8,
            'billing' => 12450.00,
        ],
        'nodes' => [
            ['hostname' => 'us-east-worker-01', 'region' => 'us-east-1', 'status' => 'healthy'],
            ['hostname' => 'eu-west-worker-04', 'region' => 'eu-west-1', 'status' => 'healthy'],
        ]
    ]);
});
`,
      },
    ],
  },
  {
    id: 'react-to-svelte5',
    name: 'React TS to Svelte 5 (Runes)',
    nameFa: 'ری‌اکت به Svelte 5 (با ران‌های مدرن)',
    tagline: '3 Files • Hooks to $state, $derived, $effect',
    taglineFa: '۳ فایل • تبدیل هوک‌ها به $state و $derived و $effect',
    sourceStack: 'react',
    targetStack: 'svelte',
    description:
      'Transform React useState, useMemo, and useEffect directly into modern Svelte 5 runes with typed interfaces.',
    descriptionFa:
      'تبدیل هوک‌های ری‌اکت شامل useState و useMemo به ران‌های جدید و فوق‌سریع Svelte 5.',
    files: [
      {
        id: 'sve1',
        path: 'src/types/todo.ts',
        language: 'typescript',
        content: `export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'high';
}
`,
      },
      {
        id: 'sve2',
        path: 'src/components/TodoFilter.tsx',
        language: 'typescript',
        content: `import React, { useState, useMemo } from 'react';
import { Todo } from '../types/todo';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
}

export const TodoFilter: React.FC<Props> = ({ todos, onToggle }) => {
  const [filter, setFilter] = useState<'all' | 'high'>('all');

  const filtered = useMemo(() => {
    return filter === 'high' ? todos.filter((t) => t.priority === 'high') : todos;
  }, [todos, filter]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs">
        <button onClick={() => setFilter('all')} className="px-2.5 py-1 bg-slate-800 text-white rounded">All</button>
        <button onClick={() => setFilter('high')} className="px-2.5 py-1 bg-rose-900/60 text-rose-200 rounded">High Priority</button>
      </div>
      <ul className="space-y-1">
        {filtered.map((t) => (
          <li key={t.id} onClick={() => onToggle(t.id)} className="cursor-pointer text-xs p-2 rounded bg-slate-900 hover:bg-slate-800 flex items-center justify-between">
            <span>{t.text}</span>
            <span className="text-[10px] text-slate-400">{t.completed ? 'Done' : 'Pending'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
`,
      },
      {
        id: 'sve3',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { TodoFilter } from './components/TodoFilter';
import { Todo } from './types/todo';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Audit monorepo workspaces', completed: true, priority: 'high' },
    { id: '2', text: 'Migrate to Svelte 5 runes', completed: false, priority: 'high' },
    { id: '3', text: 'Setup Livewire 3 components', completed: false, priority: 'low' },
  ]);

  useEffect(() => {
    console.log('Todos updated, count:', todos.length);
  }, [todos]);

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <main className="p-6 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-xl">
      <h1 className="text-lg font-bold text-white mb-4">Sprint Goals</h1>
      <TodoFilter todos={todos} onToggle={toggleTodo} />
    </main>
  );
}
`,
      },
    ],
  },
  {
    id: 'css-to-tailwind',
    name: 'CSS Modules to Tailwind CSS v4',
    nameFa: 'سی‌اس‌اس قدیمی به Tailwind CSS v4',
    tagline: '3 Files • Raw CSS Stylesheets + Markup',
    taglineFa: '۳ فایل • استایل‌شیت‌های خارجی به کلاس‌های یوتیلیتی',
    sourceStack: 'css',
    targetStack: 'tailwind',
    description:
      'Convert raw BEM/custom CSS stylesheets with flexbox, grid, hover states, and responsive queries directly into clean utility classes in JSX.',
    descriptionFa:
      'استخراج کدهای BEM و استایل‌شیت‌های جداگانه به کلاس‌های تولیدی Tailwind CSS v4.',
    files: [
      {
        id: 's1',
        path: 'src/styles/card.css',
        language: 'css',
        content: `.pricing-card {
  background-color: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.pricing-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
}
.pricing-card__price {
  font-size: 2.25rem;
  font-weight: 800;
  color: #38bdf8;
  margin: 16px 0;
}
`,
      },
      {
        id: 's2',
        path: 'src/styles/buttons.css',
        language: 'css',
        content: `.btn-primary {
  background-color: #38bdf8;
  color: #030712;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
}
`,
      },
      {
        id: 's3',
        path: 'src/components/PricingCard.jsx',
        language: 'javascript',
        content: `import React from 'react';
import '../styles/card.css';
import '../styles/buttons.css';

export function PricingCard({ plan, price, features }) {
  return (
    <div className="pricing-card">
      <h3 className="pricing-card__title">{plan}</h3>
      <div className="pricing-card__price">\${price}</div>
      <button className="btn-primary">Choose {plan}</button>
    </div>
  );
}
`,
      },
    ],
  },
];
