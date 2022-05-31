// Workaround for `export * as slimdom`, which doesn't work well in some TS versions
import * as _slimdom from 'https://esm.sh/slimdom@3.1.0';
export const slimdom = _slimdom;

export type { Options } from './src/options.ts';
export { DEFAULT_OPTIONS } from './src/options.ts';
export { DEFAULT_NAMESPACES } from './src/createNamespaceContext.ts';
export { async } from './src/asynchronouslyParseSlimdomDocument.ts';
export { sync } from './src/synchronouslyParseSlimdomDocument.ts';
