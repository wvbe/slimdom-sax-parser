// Workaround for `export * as slimdom`, which doesn't work well in some TS versions
import * as _slimdom from 'slimdom';
export const slimdom = _slimdom;

export { async } from './asynchronouslyParseSlimdomDocument';
export { sync } from './synchronouslyParseSlimdomDocument';
