import { expect, it, run } from 'https://deno.land/x/tincan/mod.ts';
import { sync } from '../src/index.ts';

const types = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12
};

const doc = sync(
	[
		// Note that the following line is an XML version declaration. Not a PI (https://github.com/isaacs/sax-js/issues/178)
		`<?xml version="1.0"?>`,
		`<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns">`,
		`<?pi-target pi-data?>`,
		`<!-- comment -->`,
		`<root attr="val">`,
		`<contains-text>text</contains-text>`,
		`<a:root xmlns="http://default" xmlns:a="http://a" xmlns:b="http://b" xmlns:d="http://d" a:attr="A" b:attr="B" attr="def">`,
		`<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" />`,
		`<a:next-sibling a:attr="AAA" />`,
		`</a:root>`,
		`<![CDATA[cdata]]>`,
		`</root>`
	].join('')
);

it('elements', () => {
	const subject = doc.documentElement?.firstChild?.nextSibling as any;
	expect(() => sync(`<xml un:declared="test" />`)).toThrow('unbound namespace prefix: "un".');
	expect(subject?.nodeType).toBe(types.ELEMENT_NODE);
	expect(subject?.nodeName).toBe('a:root');
	expect(subject?.localName).toBe('root');
});

it('attributes', () => {
	const subject = doc.documentElement?.firstChild?.nextSibling as any; // <a:root>
	expect(subject.getAttributeNS(null, 'attr')).toBe('def');
	expect(subject.getAttributeNS('http://default', 'attr')).toBeNull();
	expect(subject.getAttribute('attr')).toBe('def');
	expect(subject.getAttributeNS('http://a', 'attr')).toBe('A');
	expect(subject.getAttributeNS('http://b', 'attr')).toBe('B');

	// Declarations are attributes as well
	expect(subject.getAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns')).toBe('http://default');
	expect(subject.getAttributeNS('http://www.w3.org/2000/xmlns/', 'a')).toBe('http://a');

	// Assert overriding namespace prefixes
	expect(subject.firstChild.nodeName).toBe('a:child');
	expect(subject.firstChild.localName).toBe('child');
	expect(subject.firstChild.getAttributeNS('http://a', 'attr')).toBe('A');
	expect(subject.firstChild.getAttributeNS('http://b', 'attr')).toBe('B');
	expect(subject.firstChild.getAttributeNS('http://d', 'attr')).toBe('d');

	expect(subject.firstChild.nextSibling.getAttributeNS('http://a', 'attr')).toBe('AAA');
});

it('predefined namespaces', () => {
	const doc = sync(`<root xml:lang="pl" />`);
	const subject = doc.documentElement;
	expect(subject?.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang')).toBe('pl');
	expect(subject?.getAttribute('xml:lang')).toBe('pl');
});

it('additional namespaces', () => {
	const doc = sync(`<nerf:xml un:declared="test" />`, {
		additionalNamespaces: { nerf: 'http://nerf.uri', un: 'defined' }
	});
	expect(doc.documentElement?.nodeName).toBe('nerf:xml');
	expect(doc.documentElement?.localName).toBe('xml');
});

it('Default namespace declarations do not apply directly to attribute names', () => {
	const doc = sync(`<root xmlns="http://derp" blyat="kurwa" />`);
	const subject = doc.documentElement;
	expect(subject?.getAttributeNS(null, 'blyat')).toBe('kurwa');
	expect(subject?.getAttribute('blyat')).toBe('kurwa');
	expect(subject?.hasAttribute('ns0:blyat')).toBe(false);
});

it('Undefined namespaces will throw an error', () => {
	expect(() => sync(`<boop:root nerf="pl" />`)).toThrow('unbound namespace prefix: "boop"');
	expect(() => sync(`<root skeet:nerf="pl" />`)).toThrow('unbound namespace prefix: "skeet"');
});


run();