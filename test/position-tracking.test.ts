import { evaluateXPath, evaluateXPathToNodes } from 'fontoxpath';
import { sync } from '../src/index';

// Make the tests STFU
type PositionTrackedNode = any;

function stringForPosition(xmlString: string, pos: any): string {
	const correctSubString = xmlString.substring(pos.start, pos.end);
	// console.log(xmlString, pos, correctSubString);
	return correctSubString;
}

function stringForFullElementPosition(xmlString: string, pos: any, closePos: any): string {
	const correctSubString = xmlString.substring(pos.start, closePos.end);
	// console.log(xmlString, pos, closePos, correctSubString);
	return correctSubString;
}

describe('doc types', () => {
	const xml = `<!DOCTYPE test PUBLIC "test" "test"><x />`;
	const doc = sync(xml, { position: true });

	test('the doctype declaration', () => {
		const context = doc.firstChild as PositionTrackedNode;
		const contextXml = `<!DOCTYPE test PUBLIC "test" "test">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(36);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
		expect(context.closePosition).toBeUndefined();
	});

	test('the successive element', () => {
		const context = doc?.firstChild?.nextSibling as PositionTrackedNode;
		const contextXml = `<x />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(36);
		expect(context.position.end).toBe(41);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(37);
		expect(stringForFullElementPosition(xml, context.position, context.closePosition)).toBe(
			contextXml
		);
		expect(context.closePosition.start).toBe(41);
		expect(context.closePosition.end).toBe(41);
		expect(context.closePosition.line).toBe(1);
		expect(context.closePosition.column).toBe(42);
	});
});

describe('processing instructions', () => {
	const xml = `<?pi-target pi-data?><x />`;
	const doc = sync(xml, { position: true });

	test('the processing instruction', () => {
		const context = evaluateXPath('/processing-instruction()[1]', doc) as PositionTrackedNode;
		const contextXml = `<?pi-target pi-data?>`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(21);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
		expect(context.closePosition).toBeUndefined();
	});

	test('the successive element', () => {
		const context = evaluateXPath('/element()[1]', doc) as PositionTrackedNode;
		const contextXml = `<x />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(21);
		expect(context.position.end).toBe(26);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(22);
		expect(stringForFullElementPosition(xml, context.position, context.closePosition)).toBe(
			contextXml
		);
		expect(context.closePosition.start).toBe(26);
		expect(context.closePosition.end).toBe(26);
		expect(context.closePosition.line).toBe(1);
		expect(context.closePosition.column).toBe(27);
	});

	const xml2 = `<!DOCTYPE test PUBLIC "test" "test"><?pi-test    ?><x />`;
	const doc2 = sync(xml2, { position: true });
	test('processing instruction in the middle', () => {
		const context = evaluateXPath('/processing-instruction()[1]', doc2) as PositionTrackedNode;
		const contextXml = `<?pi-test    ?>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(36);
		expect(context.position.end).toBe(51);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(37);
		expect(context.closePosition).toBeUndefined();
	});
});

it('comments', () => {
	const xml = `<!-- comment --><x /><!--
			a multi-line comment
		-->`;
	const doc = sync(xml, { position: true });

	const firstComment = evaluateXPath('/comment()[1]', doc) as PositionTrackedNode;
	// expect(firstComment.position.line).toBe(1);
	// expect(firstComment.position.column).toBe(1);
	expect(stringForPosition(xml, firstComment.position)).toBe(`<!-- comment -->`);
	expect(firstComment.closePosition).toBeUndefined();

	const secondComment = evaluateXPath('/comment()[2]', doc) as PositionTrackedNode;
	// expect(secondComment.position.line).toBe(1);
	// expect(secondComment.position.column).toBe(22);
	expect(stringForPosition(xml, secondComment.position)).toBe(`<!--
			a multi-line comment
		-->`);
	expect(secondComment.closePosition).toBeUndefined();

	// The following item should have the correct starting offset. This is explicitly tested because the end offset and
	// column integers are +1'd for comment nodes as a fix for erratic behaviour from saxes.
	// @TODO: Triage issue and tell saxes
	const firstElement = evaluateXPath('/element()[1]', doc) as PositionTrackedNode;
	// expect(firstElement.position.line).toBe(1);
	// expect(firstElement.position.column).toBe(17);
	expect(stringForPosition(xml, firstElement.position)).toBe(`<x />`);
	expect(stringForPosition(xml, firstElement.closePosition)).toBe('');
	expect(
		stringForFullElementPosition(xml, firstElement.position, firstElement.closePosition)
	).toBe('<x />');
});

describe('elements', () => {
	const xml = `<root-node nerf="derp"
		sk="z"><self-closing unit="" /></root-node>`;
	const doc = sync(xml, { position: true });

	test('the root element instruction', () => {
		const context = evaluateXPath('/element()[1]', doc) as PositionTrackedNode;
		const contextXml = `<root-node nerf="derp"
		sk="z">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(0);
		expect(context.position.end).toBe(32);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(1);
		expect(stringForFullElementPosition(xml, context.position, context.closePosition)).toBe(
			xml
		);
		expect(context.closePosition.start).toBe(56);
		expect(context.closePosition.end).toBe(68);
		expect(context.closePosition.line).toBe(2);
		expect(context.closePosition.column).toBe(34);
	});

	test('the child element', () => {
		const context = evaluateXPath('/element()[1]/element()[1]', doc) as PositionTrackedNode;
		const contextXml = `<self-closing unit="" />`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(32);
		expect(context.position.end).toBe(56);
		expect(context.position.line).toBe(2);
		expect(context.position.column).toBe(10);
		expect(stringForFullElementPosition(xml, context.position, context.closePosition)).toBe(
			contextXml
		);
		expect(context.closePosition.start).toBe(56);
		expect(context.closePosition.end).toBe(56);
		expect(context.closePosition.line).toBe(2);
		expect(context.closePosition.column).toBe(34);
	});

	// This would fail if the closing tags of elements were not tracked in onCloseTag
	const xml2 = `<x><a></a><b /><c></c></x>`;
	const doc2 = sync(xml2, { position: true });
	test('another child element', () => {
		const context = evaluateXPath('/*/a', doc2) as PositionTrackedNode;
		const contextXml = `<a>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(3);
		expect(context.position.end).toBe(6);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(4);
		expect(stringForFullElementPosition(xml2, context.position, context.closePosition)).toBe(
			`<a></a>`
		);
		expect(context.closePosition.start).toBe(6);
		expect(context.closePosition.end).toBe(10);
		expect(context.closePosition.line).toBe(1);
		expect(context.closePosition.column).toBe(7);
	});
	test('a self-closing element', () => {
		const context = evaluateXPath('/*/b', doc2) as PositionTrackedNode;
		const contextXml = `<b />`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(10);
		expect(context.position.end).toBe(15);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(11);
		expect(stringForFullElementPosition(xml2, context.position, context.closePosition)).toBe(
			contextXml
		);
		expect(context.closePosition.start).toBe(15);
		expect(context.closePosition.end).toBe(15);
		expect(context.closePosition.line).toBe(1);
		expect(context.closePosition.column).toBe(16);
	});
	test('another child element #2', () => {
		const context = evaluateXPath('/*/c', doc2) as PositionTrackedNode;
		const contextXml = `<c>`;
		expect(stringForPosition(xml2, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(15);
		expect(context.position.end).toBe(18);
		expect(context.position.line).toBe(1);
		expect(context.position.column).toBe(16);
		expect(stringForFullElementPosition(xml2, context.position, context.closePosition)).toBe(
			`<c></c>`
		);
		expect(context.closePosition.start).toBe(18);
		expect(context.closePosition.end).toBe(22);
		expect(context.closePosition.line).toBe(1);
		expect(context.closePosition.column).toBe(19);
	});
});

it('attributes', () => {
	const xml = `<bar xmlns:x="http://skeet" test1="val1" test2="val2"   test3="val3"     test4="val4"
		test5="val5" test6="va

			l

		6"  x:test7="val7"
	/>`;
	const doc = sync(xml, { position: true });

	const [test1, test2, test3, test4, test5, test6, test7] = evaluateXPathToNodes(
		'/*/attribute()',
		doc
	) as PositionTrackedNode;

	expect(test1.value).toBe('val1');
	expect(test1.position.end).toBe(40);

	expect(test2.value).toBe('val2');
	expect(test2.position.end).toBe(40 + 13);

	expect(test3.value).toBe('val3');
	expect(test3.position.end).toBe(40 + 13 + 15);

	expect(test4.value).toBe('val4');
	expect(test4.position.end).toBe(40 + 13 + 15 + 17);

	expect(test5.value).toBe('val5');
	expect(test5.position.end).toBe(40 + 13 + 15 + 17 + 15);

	//  Newlines and tabs are each converted to a single space
	expect(test6.value).toBe('va     l    6');
	expect(test6.position.end).toBe(40 + 13 + 15 + 17 + 15 + 22);

	expect(test7.value).toBe('val7');
	expect(test7.position.end).toBe(40 + 13 + 15 + 17 + 15 + 22 + 16);

	// Duplicately defined attributes do not need to be tested on position tracking, because saxes
	// would error out on it.
	expect(() => sync(`<x a="b" a="b" />`)).toThrow('duplicate attribute');
});

it('text nodes', () => {
	const xml = `<x><!--z-->textA1<!--x-->text
		B1<z>textC</z> textB2 <?y?>text
		A2</x ><!--EOF test-->`;
	const doc = sync(xml, { position: true });

	expect(stringForPosition(xml, evaluateXPath('/*/text()[1]', doc).position)).toBe(`textA1`);
	expect(evaluateXPath('/*/text()[1]', doc).closePosition).toBeUndefined();

	expect(stringForPosition(xml, evaluateXPath('/*/text()[4]', doc).position)).toBe(`text
		A2`);

	expect(stringForPosition(xml, evaluateXPath('/*/text()[2]', doc).position)).toBe(`text
		B1`);

	expect(stringForPosition(xml, evaluateXPath('/*/text()[3]', doc).position)).toBe(` textB2 `);

	expect(stringForPosition(xml, evaluateXPath('/*/*/text()[1]', doc).position)).toBe(`textC`);

	expect(stringForPosition(xml, evaluateXPath('/comment()', doc).position)).toBe(
		`<!--EOF test-->`
	);
	expect(evaluateXPath('/comment()', doc).closePosition).toBeUndefined();
});

it('cdata', () => {
	const xml = `<x><![CDATA[
			skrr
		]]></x>`;
	const doc = sync(xml, { position: true });
	const context = doc?.documentElement?.firstChild as PositionTrackedNode;
	expect(stringForPosition(xml, context.position)).toBe(`<![CDATA[
			skrr
		]]>`);
	expect(context.closePosition).toBeUndefined();
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
		<p>
			Encode &lt;entities&gt;
				&amp; to succeed &#8232; or fail.
		</p>
	</root>`;
	const doc = sync(xml, { position: true });

	// KNOWN ISSUE the xml declaration is not picked up as a child node!
	xtest('the doctype declaration', () => {
		const context = doc.childNodes[1] as PositionTrackedNode;
		const contextXml = `<!DOCTYPE test PUBLIC "test" "test">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(25);
		expect(context.position.end).toBe(51);
		expect(context.position.line).toBe(3);
		expect(context.position.column).toBe(3);
		expect(context.closePosition).toBeUndefined();
	});

	test('the comment', () => {
		const context = evaluateXPath('/comment()[1]', doc) as PositionTrackedNode;
		const contextXml = `<!-- multi-line
		comment -->`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(61);
		expect(context.position.end).toBe(90);
		expect(context.position.line).toBe(3);
		expect(context.position.column).toBe(39);
		expect(context.closePosition).toBeUndefined();
	});

	test('the root element', () => {
		const context = evaluateXPath('/element()[1]', doc) as PositionTrackedNode;
		const contextXml = `<root attr="val">`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		// expect(context.position.start).toBe(173);
		// expect(context.position.end).toBe(21);
		// expect(context.position.line).toBe(7);
		// expect(context.position.column).toBe(3);
	});

	test('a multi-line child element', () => {
		const context = evaluateXPath('/element()[1]/element()[2]', doc) as PositionTrackedNode;
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
		expect(stringForFullElementPosition(xml, context.position, context.closePosition)).toBe(
			contextXml +
				`gewoon beetje tekst
			<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" />
			snapje
			<a:next-sibling a:attr="AAA" />
		</a:root>`
		);
		expect(context.closePosition.start).toBe(471);
		expect(context.closePosition.end).toBe(480);
		expect(context.closePosition.line).toBe(15);
		expect(context.closePosition.column).toBe(3);
	});

	test('a multi-line text node', () => {
		const context = evaluateXPath('//Q{http://a}root/text()[2]', doc) as PositionTrackedNode;
		const contextXml = `
			snapje
			`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(423);
		expect(context.position.end).toBe(437);
		expect(context.position.line).toBe(12);
		expect(context.position.column).toBe(97);
		expect(context.closePosition).toBeUndefined();
	});

	test('text with encoded entities', () => {
		const context = evaluateXPath(
			'//element()[1]/element()[3]/text()[1]',
			doc
		) as PositionTrackedNode;
		const contextXml = `
			Encode &lt;entities&gt;
				&amp; to succeed &#8232; or fail.
		`;
		expect(stringForPosition(xml, context.position)).toBe(contextXml);
		expect(context.position.start).toBe(506);
		expect(context.position.end).toBe(574);
		expect(context.position.line).toBe(17);
		expect(context.position.column).toBe(6);
		expect(context.closePosition).toBeUndefined();
	});
});

it('No position property if not tracking', () => {
	const xml = `<x />`;
	const doc = sync(xml, { position: false });

	expect((doc.documentElement as any).position).toBeUndefined();
	expect((doc.documentElement as any).closePosition).toBeUndefined();
});
