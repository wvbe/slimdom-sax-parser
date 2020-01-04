/* eslint-env jest */

const { evaluateXPath } = require('fontoxpath');

const { sync } = require('../index');

function stringForPosition(xmlString, pos) {
	const correctSubString = xmlString.substring(pos.start, pos.end);
	// console.log(xmlString, pos, correctSubString);
	return correctSubString;
}

describe('doc types', () => {
	const xml = `<!DOCTYPE test PUBLIC "test" "test"><x />`;
	const doc = sync(xml, { position: true });

	test('the doctype declaration', () => {
		const context = doc.firstChild;
		const contextXml = `<!DOCTYPE test PUBLIC "test" "test">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(36);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
	});

	test('the succesive element', () => {
		const context = doc.firstChild.nextSibling;
		const contextXml = `<x />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(36);
		expect(context.position.end).toBe(41);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(37);
	});
});

describe('processing instructions', () => {
	const xml = `<?pi-target pi-data?><x />`;
	const doc = sync(xml, { position: true });

	test('the processing instruction', () => {
		const context = evaluateXPath('/processing-instruction()[1]', doc);
		const contextXml = `<?pi-target pi-data?>`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(21);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
	});

	test('the succesive element', () => {
		const context = evaluateXPath('/element()[1]', doc);
		const contextXml = `<x />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(21);
		expect(context.position.end).toBe(26);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(22);
	});

	const xml2 = `<!DOCTYPE test PUBLIC "test" "test"><?pi-test    ?><x />`;
	const doc2 = sync(xml2, { position: true });
	test('processing instruction in the middle', () => {
		const context = evaluateXPath('/processing-instruction()[1]', doc2);
		const contextXml = `<?pi-test    ?>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(36);
		expect(context.position.end).toBe(51);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(37);
	});
});

it('comments', () => {
	const xml = `<!-- comment --><x /><!--
			a multi-line comment
		-->`;
	const doc = sync(xml, { position: true });

	const firstComment = evaluateXPath('/comment()[1]', doc);
	// expect(firstComment.position.line).toBe(1);
	// expect(firstComment.position.column).toBe(1);
	expect(stringForPosition(xml, firstComment.position)).toBe(`<!-- comment -->`);

	const secondComment = evaluateXPath('/comment()[2]', doc);
	// expect(secondComment.position.line).toBe(1);
	// expect(secondComment.position.column).toBe(22);
	expect(stringForPosition(xml, secondComment.position)).toBe(`<!--
			a multi-line comment
		-->`);

	// The following item should have the correct starting offset. This is explicitly tested because the end offset and
	// column integers are +1'd for comment nodes as a fix for erratic behaviour from saxes.
	// @TODO: Triage issue and tell saxes
	const firstElement = evaluateXPath('/element()[1]', doc);
	// expect(firstElement.position.line).toBe(1);
	// expect(firstElement.position.column).toBe(17);
	expect(stringForPosition(xml, firstElement.position)).toBe(`<x />`);
});

describe('elements', () => {
	const xml = `<root-node nerf="derp"
		sk="z"><self-closing unit="" /></root-node>`;
	const doc = sync(xml, { position: true });

	test('the root element instruction', () => {
		const context = evaluateXPath('/element()[1]', doc);
		const contextXml = `<root-node nerf="derp"
		sk="z">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(32);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
	});

	test('the child element', () => {
		const context = evaluateXPath('/element()[1]/element()[1]', doc);
		const contextXml = `<self-closing unit="" />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(32);
		expect(context.position.end).toBe(56);
		expect(context.position.line).toBe(2);
		expect(context.position.column).toBe(10);
	});

	// This would fail if the closing tags of elements were not tracked in onCloseTag
	const xml2 = `<x><a></a><b /><c></c></x>`;
	const doc2 = sync(xml2, { position: true });
	test('another child element', () => {
		const context = evaluateXPath('/*/a', doc2);
		const contextXml = `<a>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(3);
		expect(context.position.end).toBe(6);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(4);
	});
	test('a self-closing element', () => {
		const context = evaluateXPath('/*/b', doc2);
		const contextXml = `<b />`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(10);
		expect(context.position.end).toBe(15);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(11);
	});
	test('another child element #2', () => {
		const context = evaluateXPath('/*/c', doc2);
		const contextXml = `<c>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(15);
		expect(context.position.end).toBe(18);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(16);
	});
});

it('text nodes', () => {
	const xml = `<x><!--z-->textA1<!--x-->text
		B1<z>textC</z> textB2 <?y?>text
		A2</x ><!--EOF test-->`;
	const doc = sync(xml, { position: true });

	expect(stringForPosition(xml, evaluateXPath('/*/text()[1]', doc).position)).toBe(`textA1`);
	expect(stringForPosition(xml, evaluateXPath('/*/text()[4]', doc).position)).toBe(`text
		A2`);

	expect(stringForPosition(xml, evaluateXPath('/*/text()[2]', doc).position)).toBe(`text
		B1`);
	expect(stringForPosition(xml, evaluateXPath('/*/text()[3]', doc).position)).toBe(` textB2 `);

	expect(stringForPosition(xml, evaluateXPath('/*/*/text()[1]', doc).position)).toBe(`textC`);

	expect(stringForPosition(xml, evaluateXPath('/comment()', doc).position)).toBe(
		`<!--EOF test-->`
	);
});

it('cdata', () => {
	const xml = `<x><![CDATA[
			skrr
		]]></x>`;
	const doc = sync(xml, { position: true });
	expect(stringForPosition(xml, doc.documentElement.firstChild.position)).toBe(`<![CDATA[
			skrr
		]]>`);
});

describe('Various things in a messy XML file', () => {
	const xml = `<?xml version="1.0"?>

		<!DOCTYPE test PUBLIC "test" "test"><!-- multi-line
		comment --><?pi-target pi-data?><root attr="val">
		<contains-text>
			text</contains-text>
		<a:root xmlns="http://default"
			xmlns:a="http://a"
			xmlns:b="http://b"
			xmlns:d="http://d"
			a:attr="A"  b:attr="B" attr="def">gewoon beetje tekst
			<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" />
			snapje
			<a:next-sibling a:attr="AAA" />
		</a:root>
	<![CDATA[cdata]]>
	</root>`;
	const doc = sync(xml, { position: true });

	// KNOWN ISSUE the xml declaration is not picked up as a child node!
	xtest('the doctype declaration', () => {
		const context = doc.childNodes[1];
		const contextXml = `<!DOCTYPE test PUBLIC "test" "test">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(25);
		expect(context.position.end).toBe(51);
		expect(context.position.line).toBe(3);
		expect(context.position.column).toBe(3);
	});

	test('the comment', () => {
		const context = evaluateXPath('/comment()[1]', doc);
		const contextXml = `<!-- multi-line
		comment -->`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(61);
		expect(context.position.end).toBe(90);
		expect(context.position.line).toBe(3);
		expect(context.position.column).toBe(39);
	});

	test('the root element', () => {
		const context = evaluateXPath('/element()[1]', doc);
		const contextXml = `<root attr="val">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		// expect(context.position.start).toBe(173);
		// expect(context.position.end).toBe(21);
		// expect(context.position.line).toBe(7);
		// expect(context.position.column).toBe(3);
	});

	test('a multi-line child element', () => {
		const context = evaluateXPath('/element()[1]/element()[2]', doc);
		const contextXml = `<a:root xmlns="http://default"
			xmlns:a="http://a"
			xmlns:b="http://b"
			xmlns:d="http://d"
			a:attr="A"  b:attr="B" attr="def">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(173);
		expect(context.position.end).toBe(307);
		expect(context.position.line).toBe(7);
		expect(context.position.column).toBe(3);
	});

	test('a multi-line text node', () => {
		const context = evaluateXPath('//Q{http://a}root/text()[2]', doc);
		const contextXml = `
			snapje
			`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(423);
		expect(context.position.end).toBe(437);
		expect(context.position.line).toBe(12);
		expect(context.position.column).toBe(97);
	});
});

it('No position property if not tracking', () => {
	const xml = `<x />`;
	const doc = sync(xml, { position: false });

	expect(doc.documentElement.position).toBeUndefined();
});
