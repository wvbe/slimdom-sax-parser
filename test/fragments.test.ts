import { sync } from '../src/index';

it('can parse fragment', () => {
	const parsed = sync('<a>foo</a><b>foo</b>', { fragment: true });
	expect(parsed.nodeType).toBe(11);
	expect(parsed.childElementCount).toBe(2);
});
