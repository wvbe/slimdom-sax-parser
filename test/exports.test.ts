import * as mod from '../src/index';

it('exports all the expected things', () => {
	expect(mod.sync).not.toBeUndefined();
	expect(mod.slimdom).not.toBeUndefined();
});
