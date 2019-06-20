const { sync } = require('./index');

const xmlString = `<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns"><?pi-target pi-data?><!-- comment --><root attr="val"><contains-text>text</contains-text><a:root xmlns="http://default" xmlns:a="http://a" xmlns:b="http://b" xmlns:d="http://d" a:attr="A" b:attr="B" attr="def"><a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" /><a:next-sibling a:attr="AAA" /></a:root><![CDATA[cdata]]></root>
`.trim();

const doc = sync(xmlString, { position: true });

function stringForPosition (pos) {
	console.log(pos.start.offset, pos.end.offset);
	return xmlString.substring(pos.start.offset, pos.end.offset);
}

// function stringForPosition (pos) {
// 	const lines = xmlString.split('\n');
// 	console.log(pos.start.offset, pos.end.offset);
// 	return lines[pos.start.line - 1];//xmlString.substring(pos.start.offset, pos.end.offset);
// }

xit('doc types', () => {
	expect(stringForPosition(doc.firstChild.position))
		.toBe(`<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns">`);
});

xit('processing instructions', () => {
	expect(stringForPosition(doc.firstChild.nextSibling.position))
		.toBe(`<?pi-target pi-data?>`);
});

xit('comments', () => {
	expect(stringForPosition(doc.firstChild.nextSibling.nextSibling.position))
		.toBe(`<!-- comment -->`);
});

xit('elements', () => {
	expect(stringForPosition(doc.documentElement.position))
		.toBe(`<root attr="val">
		<contains-text>text</contains-text>
		<a:root xmlns="http://default" xmlns:a="http://a" xmlns:b="http://b" xmlns:d="http://d" a:attr="A" b:attr="B" attr="def">
			<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" />
			<a:next-sibling a:attr="AAA" />
		</a:root>
		<![CDATA[cdata]]>
	</root>`);
});

xit('text nodes', () => {
	expect(stringForPosition(doc.documentElement.firstChild.firstChild.position))
		.toBe(`text`);
});

xit('cdata', () => {
	expect(stringForPosition(doc.documentElement.firstChild.nextSibling.nextSibling.position))
		.toBe(`<![CDATA[cdata]]>`);
});

xit('attributes', () => {
	expect(stringForPosition(doc.documentElement.attributes[0].position))
		.toBe(`attr="val"`);
});
