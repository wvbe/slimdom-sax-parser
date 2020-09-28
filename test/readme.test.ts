import { Element } from 'slimdom';
import { Readable } from 'stream';
import { async, sync, slimdom } from '../src/index';
import { evaluateXPath, evaluateXPathToNodes } from 'fontoxpath';

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
	// Mock fs.
	const fs = {
		createReadStream: (_fileName: string) => {
			return Readable.from(`<foo><bar /><bar /></foo>`);
		},
		promises: {
			writeFile: async (_filePath: string, _content: string) => {}
		}
	};

	const filePath = './file.xml';

	const xmlStream = fs.createReadStream(filePath);
	const document = await async(xmlStream);

	const barNodes = evaluateXPathToNodes('//bar/*', document);
	for (const barNode of barNodes) {
		(barNode as Element).setAttribute('bar', 'baz');
	}

	await fs.promises.writeFile(filePath, slimdom.serializeToWellFormedString(document));
});
