const { sync } = require('./index');
const { evaluateXPath } = require('fontoxpath');

function stringForPosition(xmlString, pos) {
	return xmlString.substring(pos.start, pos.end);
}

it('doc types', () => {
	const xml = `<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns"><x />`;
	const doc = sync(xml, { position: true });
	expect(stringForPosition(xml, doc.firstChild.position))
		.toBe(`<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns">`);
});

it('processing instructions', () => {
	const xml = `<?pi-target pi-data?><x />`;
	const doc = sync(xml, { position: true });
	expect(stringForPosition(xml, evaluateXPath('/processing-instruction()', doc).position))
		.toBe(`<?pi-target pi-data?>`);

	const xml2 = `<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns"><?pi-tarssdgsget    ?><x />`;
	const doc2 = sync(xml2, { position: true });
	expect(stringForPosition(xml2, evaluateXPath('/processing-instruction()', doc2).position))
		.toBe(`<?pi-tarssdgsget    ?>`);
});

it('comments', () => {
	const xml = `<!-- comment --><x /><!--
			a multi-line comment
		-->`;
	const doc = sync(xml, { position: true });

	expect(stringForPosition(xml, evaluateXPath('/comment()[1]', doc).position))
		.toBe(`<!-- comment -->`);
	expect(stringForPosition(xml, evaluateXPath('/comment()[2]', doc).position))
		.toBe(`<!--
			a multi-line comment
		-->`);

	// The following item should have the correct starting offset. This is explicitly tested because the end offset and
	// column integers are +1'd for comment nodes as a fix for erratic behaviour from saxes.
	// @TODO: Triage issue and tell saxes
	expect(stringForPosition(xml, evaluateXPath('/element()', doc).position))
		.toBe(`<x />`);
});

it('elements', () => {
	const xml = `<root-node nerf="derp"
		sk="z"><self-closing unit="" /></root-node>`;
	const doc = sync(xml, { position: true });
	expect(stringForPosition(xml, doc.documentElement.position))
		.toBe(`<root-node nerf="derp"
		sk="z">`);
	expect(stringForPosition(xml, doc.documentElement.firstChild.position))
		.toBe(`<self-closing unit="" />`);

	// This would fail if the closing tags of elements were not tracked in onCloseTag
	const xml2 = `<x><a></a><b /><c></c></x>`;
	const doc2 = sync(xml2, { position: true });
	expect(stringForPosition(xml2, evaluateXPath('/*/a', doc2).position))
		.toBe(`<a>`);
	expect(stringForPosition(xml2, evaluateXPath('/*/c', doc2).position))
		.toBe(`<c>`);
	expect(stringForPosition(xml2, evaluateXPath('/*/b', doc2).position))
		.toBe(`<b />`);
});

it('text nodes', () => {
	const xml = `<x><!--z-->textA1<!--x-->text
		B1<z>textC</z> textB2 <?y?>text
		A2</x ><!--EOF test-->`;
	const doc = sync(xml, { position: true });

	expect(stringForPosition(xml, evaluateXPath('/*/text()[1]', doc).position))
		.toBe(`textA1`);
	expect(stringForPosition(xml, evaluateXPath('/*/text()[4]', doc).position))
		.toBe(`text
		A2`);

	expect(stringForPosition(xml, evaluateXPath('/*/text()[2]', doc).position))
		.toBe(`text
		B1`);
	expect(stringForPosition(xml, evaluateXPath('/*/text()[3]', doc).position))
		.toBe(` textB2 `);

	expect(stringForPosition(xml, evaluateXPath('/*/*/text()[1]', doc).position))
		.toBe(`textC`);

	expect(stringForPosition(xml, evaluateXPath('/comment()', doc).position))
		.toBe(`<!--EOF test-->`);
});

it('cdata', () => {
	const xml = `<x><![CDATA[
			skrr
		]]></x>`;
	const doc = sync(xml, { position: true });
	expect(stringForPosition(xml, doc.documentElement.firstChild.position))
		.toBe(`<![CDATA[
			skrr
		]]>`);
});

it('Various things in a messy XML file', () => {
	const xml = `
	<?xml version="1.0"?><!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns"><!-- multi-line
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
	</root>`.trim();
	const doc = sync(xml, { position: true });

	expect(stringForPosition(xml, evaluateXPath('/comment()', doc).position))
		.toBe(`<!-- multi-line
		comment -->`);

	expect(stringForPosition(xml, evaluateXPath('/*', doc).position))
		.toBe(`<root attr="val">`);

	expect(stringForPosition(xml, evaluateXPath('/*/*[2]', doc).position))
		.toBe(`<a:root xmlns="http://default"
			xmlns:a="http://a"
			xmlns:b="http://b"
			xmlns:d="http://d"
			a:attr="A"  b:attr="B" attr="def">`);

	expect(stringForPosition(xml, evaluateXPath('//Q{http://a}root/text()[2]', doc).position))
		.toBe(`
			snapje
			`);
});

it('No position property if not tracking', () => {
	const xml = `<x />`;
	const doc = sync(xml, { position: false });

	expect(doc.documentElement.position)
		.toBeUndefined();
});