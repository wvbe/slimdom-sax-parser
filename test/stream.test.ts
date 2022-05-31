import { expect, it, run } from 'https://deno.land/x/tincan/mod.ts';
/* eslint-env jest */

import {
	CDATASection,
	Comment,
	Document,
	DocumentType,
	Element,
	ProcessingInstruction,
} from 'https://esm.sh/slimdom@3.1.0';
import { PositionTrackedNode } from '../src/createPositionTracker.ts';
import { Readable } from 'https://deno.land/std@0.141.0/node/stream.ts';
import { async, sync } from '../src/index.ts';

const INPUT_LINES = [
	// Note that the following line is an XML version declaration. Not a PI (https://github.com/isaacs/sax-js/issues/178)
	'<?xml version="1.0"?>',
	'<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns">',
	'<?pi-target pi-data?>',
	'<!-- comment -->',
	'<root attr="val" whitespace="before\n\r\r\r\nafter">',
	'<contains-text>text</contains-text>',
	'<a:root xmlns="http://default" xmlns:a="http://a" xmlns:b="http://b" xmlns:d="http://d" a:attr="A" b:attr="B" attr="def">',
	'<a:child xmlns:c="http://a" xmlns:a="http://b" c:attr="A" a:attr="B" d:attr="d" attr="def" />',
	'<a:next-sibling a:attr="AAA" />',
	'</a:root>',
	'<![CDATA[cdata]]>',
	'</root>',
];

function checkOutputDocument(doc: Document) {
	const documentType = doc.firstChild as DocumentType;
	expect(documentType.name).toBe('something');
	expect(documentType.publicId).toBe('-//example doctype//EN');
	expect(documentType.systemId).toBe('http://www.example.org/ns');

	const processintInstruction = documentType.nextSibling as ProcessingInstruction;
	expect(processintInstruction.target).toBe('pi-target');

	const comment = processintInstruction.nextSibling as Comment;
	expect(comment.data).toBe(' comment ');

	let subject = comment.nextSibling!;
	expect(subject.nodeName).toBe('root');

	subject = subject.firstChild!;
	expect(subject.nodeName).toBe('contains-text');

	subject = subject.nextSibling!;
	expect(subject.nodeName).toBe('a:root');
	expect((subject as Element).attributes.map((a) => `${a.name}="${a.value}"`)).toEqual([
		'xmlns="http://default"',
		'xmlns:a="http://a"',
		'xmlns:b="http://b"',
		'xmlns:d="http://d"',
		'a:attr="A"',
		'b:attr="B"',
		'attr="def"',
	]);

	subject = subject.firstChild!;
	expect(subject.nodeName).toBe('a:child');
	expect((subject as Element).attributes.map((a) => `${a.name}="${a.value}"`)).toEqual([
		'xmlns:c="http://a"',
		'xmlns:a="http://b"',
		'c:attr="A"',
		'a:attr="B"',
		'd:attr="d"',
		'attr="def"',
	]);

	subject = subject.nextSibling!;
	expect(subject.nodeName).toBe('a:next-sibling');
	expect((subject as Element).attributes.map((a) => `${a.name}="${a.value}"`)).toEqual([
		'a:attr="AAA"',
	]);

	subject = subject.parentNode!.nextSibling!;
	expect((subject as CDATASection).data).toBe('cdata');
}

it('Can synchronously parse a string', () => {
	const doc = sync(INPUT_LINES.join(''));
	checkOutputDocument(doc);
});

it('Can asynchronously parse a string', async () => {
	const doc = await async(INPUT_LINES.join(''));
	checkOutputDocument(doc);
});

it('Can asynchronously parse a Readable stream', async () => {
	const xml = Readable.from(INPUT_LINES.join(''));

	const doc = await async(xml);
	checkOutputDocument(doc);
});

it('Throws when trying to asynchronously parse xml with text outside the root node', async () => {
	await expect((() => async(`skeet<x />skrrrr`))()).rejects.toThrow(
		'text data outside of root node',
	);
});

it('Honors options in when asynchronously parsing xml', async () => {
	const xmlContent = '<!DOCTYPE test PUBLIC "test" "test"><x>&test1;</x>';
	const xml = Readable.from(xmlContent);
	const doc = await async(xml, {
		additionalEntities: {
			test1: 'test completed',
		},
		position: true,
	});

	const context = doc.firstChild;
	const contextXml = `<!DOCTYPE test PUBLIC "test" "test">`;
	const position = (context as PositionTrackedNode<Element>).position;
	expect(xmlContent.substring(position.start, position.end)).toBe(contextXml);
	expect(position.start).toBe(0);
	expect(position.end).toBe(36);
	expect(position.line).toBe(1);
	expect(position.column).toBe(1);
});

run();
