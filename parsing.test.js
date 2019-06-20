const { sync } = require('./index');

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

const doc = sync([
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
].join(''));

it('doc types', () => {
	const subject = doc.firstChild;
	expect(subject.nodeType).toBe(types.DOCUMENT_TYPE_NODE);
	expect(subject.name).toBe('something');
	expect(subject.publicId).toBe('-//example doctype//EN');
	expect(subject.systemId).toBe('http://www.example.org/ns');
});

it('processing instructions', () => {
	const subject = doc.firstChild.nextSibling;

	expect(subject.nodeType).toBe(types.PROCESSING_INSTRUCTION_NODE);

	expect(subject.target).toBe('pi-target');
	expect(subject.nodeValue).toBe('pi-data');
});

it('comments', () => {
	const subject = doc.firstChild.nextSibling.nextSibling;

	expect(subject.nodeType).toBe(types.COMMENT_NODE);
});

it('elements', () => {
	const subject = doc.documentElement;

	expect(subject.nodeType).toBe(types.ELEMENT_NODE);

	expect(subject.nodeName).toBe('root');
	expect(subject.localName).toBe('root');
});

it('text nodes', () => {
	const subject = doc.documentElement.firstChild.firstChild;
	expect(subject.nodeType).toBe(types.TEXT_NODE);
});

it('cdata', () => {
	const subject = doc.documentElement.firstChild.nextSibling.nextSibling;
	expect(subject.nodeType).toBe(types.CDATA_SECTION_NODE);
});

it('attributes', () => {
	const subject = doc.documentElement;

	expect(subject.attributes[0].nodeType).toBe(types.ATTRIBUTE_NODE);

	expect(subject.getAttribute('attr')).toBe('val');
});

it('text outside the root node will throw an error', () => {
	expect(() => sync(`skeet`))
		.toThrow('text data outside of root node');
});