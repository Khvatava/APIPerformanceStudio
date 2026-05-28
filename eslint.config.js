import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // prettierConfig идёт ПОСЛЕ остальных — он выключает ESLint-правила,
      // которые конфликтуют с форматированием Prettier (отступы, кавычки и т.п.)
      prettierConfig,
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Нарушения форматирования показываются как ошибки ESLint —
      // удобно в редакторе и в lint-проверке CI
      'prettier/prettier': 'error',
      // Запрет неиспользуемых переменных, но _-префикс разрешён (для деструктуризации)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Web Worker живёт в WorkerGlobalScope, а не в window — даём ему свои globals
    files: ['src/workers/**/*.ts'],
    languageOptions: {
      globals: globals.worker,
    },
  },
])
