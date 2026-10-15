// ESLint for the game, its tests and tools: the recommended sets plus a few type-aware rules that catch real bugs here.
// No formatting or line-length rules: the code's dense layout is deliberate. Rules at 'warn' still have hits in today's code
// and are meant to become errors once those are cleared.
//
// typescript-eslint drives the TypeScript compiler through its JavaScript API, which TypeScript 7 (the compiler the build
// uses) no longer has. So, while ESLint runs, the linter's own `typescript` imports are pointed at TypeScript 6's API
// (@typescript/typescript6, and the "overrides" in package.json let npm accept the pairing); the build and typecheck still
// use TypeScript 7. TypeScript 6 brings its own `tsc`, which npm links over 7's in node_modules/.bin, so the "typecheck"
// script runs 7's by path. Drop all three once typescript-eslint supports TypeScript 7.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.includes('/node_modules/') && (specifier === 'typescript' || specifier.startsWith('typescript/')))
      return next(specifier.replace(/^typescript/, '@typescript/typescript6'), context);
    return next(specifier, context);
  },
});

const { default: js } = await import('@eslint/js');
const { default: tseslint } = await import('typescript-eslint');

export default tseslint.config(
  { ignores: ['dist/', 'public/'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { project: ['./tsconfig.json', './test/tsconfig.json'], tsconfigRootDir: import.meta.dirname } },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // node:test's test() returns a promise the runner already awaits.
      '@typescript-eslint/no-floating-promises': ['error', { allowForKnownSafeCalls: [{ from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] }] }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    // The tests tamper with saves through `any` on purpose.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);
