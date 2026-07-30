import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // this project intentionally allows `any` (see CLAUDE.md)
      '@typescript-eslint/no-explicit-any': 0,
      // uppercase wrapper types (String, Number, Boolean, Function) are
      // deliberately allowed — these are the v8 successors to the old
      // ban-types allowances (see CLAUDE.md)
      '@typescript-eslint/no-wrapper-object-types': 0,
      '@typescript-eslint/no-unsafe-function-type': 0,
      // leading-underscore convention for intentionally unused arguments
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  { ignores: ['**/dist/', 'docs/', 'tjs-out/', 'node_modules/'] }
)
