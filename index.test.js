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
	`<?DOCTYPE html?>`,
	`<!-- comment -->`,
	`<root attr="val">`,
		`<contains-text>text</contains-text>`,
		`<a:root xmlns:a="http://a" xmlns:b="http://b" a:attr="A" b:attr="B">`,
			`<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" />`,
			`<a:next-sibling a:attr="AAA" />`,
		`</a:root>`,
		`<![CDATA[cdata]]>`,
	`</root>`
].join(''), true);

it('processing instructions', () => {
	const subject = doc.firstChild;

	expect(subject.nodeType).toBe(types.PROCESSING_INSTRUCTION_NODE);

	expect(subject.target).toBe('DOCTYPE');
	expect(subject.nodeValue).toBe('html');
});

it('comments', () => {
	const subject = doc.firstChild.nextSibling;

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

it('namespaced elements', () => {
	const subject = doc.documentElement.firstChild.nextSibling;

	expect(subject.nodeType).toBe(types.ELEMENT_NODE);

	expect(subject.nodeName).toBe('a:root');
	expect(subject.localName).toBe('root');
});

it('namespaced attributes', () => {
	const subject = doc.documentElement.firstChild.nextSibling; // <a:root>

	expect(subject.getAttributeNS('http://a', 'attr')).toBe('A');
	expect(subject.getAttributeNS('http://b', 'attr')).toBe('B');

	// Assert overriding namespace prefixes
	expect(subject.firstChild.nodeName).toBe('a:child');
	expect(subject.firstChild.localName).toBe('child');
	expect(subject.firstChild.getAttributeNS('http://a', 'attr')).toBe('A');
	expect(subject.firstChild.getAttributeNS('http://b', 'attr')).toBe('B');

	expect(subject.firstChild.nextSibling.getAttributeNS('http://a', 'attr')).toBe('AAA');
});

