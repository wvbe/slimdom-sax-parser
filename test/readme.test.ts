import { Element } from 'slimdom';
import { Readable } from 'stream';
import { SaxesAttributeNS } from 'saxes';
import { evaluateXPath, evaluateXPathToBoolean, evaluateXPathToNodes } from 'fontoxpath';

import { async, sync, slimdom } from '../src/index';

// Mock fs.
const fs = {
	createReadStream: (fileName: string) => {
		if (fileName === './largeFile.xml') {
			return Readable.from(
				[
					'<?xml version="1.0"?>',
					'<!DOCTYPE something PUBLIC "-//example doctype//EN" "http://www.example.org/ns">',
					'<root>',
					'<someRelevantData>Text</someRelevantData>',
					'<object class="importantMetadata" />',
					'<object class="importantMetadata" />',
					'<object class="extraneousMetadata">',
					'<?pi-target pi-data?>',
					'<!-- comment -->',
					'<![CDATA[cdata]]>',
					'<nested><nested><nested>Nested</nested></nested></nested>',
					'</object>',
					'<properties>',
					'<irrelevantProperty />',
					'<irrelevantProperty />',
					'<relevantProperty />',
					'<relevantProperty />',
					'</properties>',
					'</root>'
				].join('')
			);
		}
		return Readable.from(`<foo><bar /><bar /></foo>`);
	},
	promises: {
		writeFile: async (_filePath: string, _content: string) => {}
	}
};

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

it('Transform a XML file', async () => {
	const filePath = './file.xml';

	const xmlStream = fs.createReadStream(filePath);
	const document = await async(xmlStream);

	const barNodes = evaluateXPathToNodes('//bar/*', document);
	for (const barNode of barNodes) {
		(barNode as Element).setAttribute('bar', 'baz');
	}

	await fs.promises.writeFile(filePath, slimdom.serializeToWellFormedString(document));
});

it('Filter out tags while parsing:', async () => {
	const xmlStream = fs.createReadStream('./largeFile.xml');
	const document = await async(xmlStream, {
		tagFilter: (tag, contextNode) => {
			if (
				tag.name === 'object' &&
				tag.attributes['class'] &&
				(tag.attributes['class'] as SaxesAttributeNS).value === 'extraneousMetadata'
			) {
				return false;
			} else if (
				evaluateXPathToBoolean('self::properties', contextNode) &&
				tag.name === 'irrelevantProperty'
			) {
				return false;
			}

			return true;
		}
	});

	const importantMetadata = evaluateXPathToNodes(
		'//object[@class = "importantMetadata"]',
		document
	);
	expect(importantMetadata.length).toBe(2);

	const extraneousMetadata = evaluateXPathToNodes(
		'//object[@class = "extraneousMetadata"]',
		document
	);
	expect(extraneousMetadata.length).toBe(0);

	const nested = evaluateXPathToNodes('//nested', document);
	expect(nested.length).toBe(0);

	const relevantProperties = evaluateXPathToNodes('//properties/relevantProperty', document);
	expect(relevantProperties.length).toBe(2);

	const irrelevantProperties = evaluateXPathToNodes('//properties/irrelevantProperty', document);
	expect(irrelevantProperties.length).toBe(0);
});
