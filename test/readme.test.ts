import { evaluateXPath } from 'fontoxpath';
import { sync, slimdom } from '../src/index';

// Asserts that the code examples in README.md are correct

it('Modify the XML DOM', () => {
	const document = sync(`<foo />`);

	document.documentElement?.setAttribute('bar', 'baz');
	expect(document.documentElement?.hasAttribute('bar')).toBeTruthy();
});

it('Use with an XPath engine', () => {
	const document = sync(`<foo><bar /><baz /></foo>`);

	expect(evaluateXPath('/foo/*/name()', document)).toEqual(['bar', 'baz']);
});

it('Use source code position tracking', () => {
	const xml = '<example><child-element /></example>';

	const document = sync(xml, { position: true });
	expect(document).toBeInstanceOf(slimdom.Document);

	const childElement = document.documentElement?.firstChild as any;
	expect(childElement).toBeInstanceOf(slimdom.Element);

	const position = childElement.position;
	expect(xml.substring(position.start, position.end)).toBe('<child-element />');
});
