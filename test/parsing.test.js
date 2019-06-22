const { evaluateXPath } = require('fontoxpath');

const { sync } = require('../index');

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

// fontoxpath playground:
// https://xpath.playground.fontoxml.com/?mode=0&variables=%7B%7D&xml=%3C%3Fxml+version%3D%221.0%22%3F%3E%0A%3C%21DOCTYPE+something+PUBLIC+%22-%2F%2Fexample+doctype%2F%2FEN%22+%22http%3A%2F%2Fwww.example.org%2Fns%22%3E%0A%3C%3Fpi-target+pi-data%3F%3E%0A%3C%21--+comment+--%3E%0A%3Croot+attr%3D%22val%22%3E%0A%09%3Ccontains-text%3Etext%3C%2Fcontains-text%3E%0A%09%3Ca%3Aroot+xmlns%3D%22http%3A%2F%2Fdefault%22+xmlns%3Aa%3D%22http%3A%2F%2Fa%22+xmlns%3Ab%3D%22http%3A%2F%2Fb%22+xmlns%3Ad%3D%22http%3A%2F%2Fd%22+a%3Aattr%3D%22A%22+b%3Aattr%3D%22B%22+attr%3D%22def%22%3E%0A%09%09%3Ca%3Achild+xmlns%3Ac%3D%22http%3A%2F%2Fa%22+xmlns%3Aa%3D%22http%3A%2F%2Fb%22+c%3Aattr%3D%22A%22+a%3Aattr%3D%22B%22+d%3Aattr%3D%22d%22+attr%3D%22def%22+%2F%3E%0A%09%09%3Ca%3Anext-sibling+a%3Aattr%3D%22AAA%22+%2F%3E%0A%09%3C%2Fa%3Aroot%3E%0A%09%3C%21%5BCDATA%5Bcdata%5D%5D%3E%0A%3C%2Froot%3E&xpath=%2F%2F*
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
	const subject = evaluateXPath('/processing-instruction()', doc);
	expect(subject.nodeType).toBe(types.PROCESSING_INSTRUCTION_NODE);
	expect(subject.target).toBe('pi-target');
	expect(subject.nodeValue).toBe('pi-data');
});

it('comments', () => {
	const subject = evaluateXPath('/comment()', doc);
	expect(subject.nodeType).toBe(types.COMMENT_NODE);
});

it('elements', () => {
	const subject = evaluateXPath('/element()', doc);
	expect(subject.nodeType).toBe(types.ELEMENT_NODE);
	expect(subject.nodeName).toBe('root');
	expect(subject.localName).toBe('root');
});

it('text nodes', () => {
	const subject = evaluateXPath('/*/*[1]/text()', doc);
	expect(subject.nodeType).toBe(types.TEXT_NODE);
});

it('cdata', () => {
	const subject = evaluateXPath('/*/*[2]', doc).nextSibling;
	expect(subject.nodeType).toBe(types.CDATA_SECTION_NODE);
});

it('attributes', () => {
	const subject = evaluateXPath('/element()', doc);
	expect(subject.attributes[0].nodeType).toBe(types.ATTRIBUTE_NODE);
	expect(subject.getAttribute('attr')).toBe('val');
});

it('text outside the root node will throw an error', () => {
	expect(() => sync(`skeet`))
		.toThrow('text data outside of root node');
});

it('XML declaration is not a processing instruction', () => {
	const doc = sync(`<?xml version="1.0" encoding="UTF-8" standalone="no" ?><?derp ?><x />`);
	expect(doc.firstChild.target).toBe('derp');
});