import { expect, it, run } from 'https://deno.land/x/tincan/mod.ts';
import * as mod from '../src/index.ts';

it('exports all the expected things', () => {
	expect(mod.async).not.toBeUndefined();
	expect(mod.sync).not.toBeUndefined();
	expect(mod.slimdom).not.toBeUndefined();
});

run();
