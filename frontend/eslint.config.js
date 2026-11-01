import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React 19 + JSX transform mới không cần import React — bỏ qua import React thừa
      // _prefix = biến intentional-unused (ví dụ destructuring bỏ password)
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^(React|_)', // React thừa (JSX runtime) + _var intentional
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    // shadcn components (export variants) + Context providers (export hook + component)
    // là pattern chuẩn — react-refresh rule chỉ áp cho pages/routes
    files: ['src/components/**', 'src/context/**', 'src/layouts/**', 'src/ability/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
