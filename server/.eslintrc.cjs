module.exports = {
  root: true,
  ignorePatterns: ['dist/', 'node_modules/', 'prisma/'],
  overrides: [
    {
      // Full type-aware linting for TypeScript source only.
      // tsconfigRootDir pins resolution to THIS folder (server/), regardless
      // of which folder the editor/ESLint process treats as its cwd.
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      env: { node: true, es2022: true, jest: true },
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      // Plain JS config files (jest.config.js, this file itself) — no
      // type-aware parsing, since they're not part of tsconfig's `include`.
      files: ['*.js', '*.cjs'],
      env: { node: true, es2022: true },
      extends: ['eslint:recommended', 'prettier'],
    },
  ],
};