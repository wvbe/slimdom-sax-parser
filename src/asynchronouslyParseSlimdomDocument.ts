import * as saxes from 'saxes';
import { DEFAULT_OPTIONS, Options } from './options';
import { Document } from 'slimdom';
import { Readable } from 'stream';

import createHandler from './createHandler';

/**
 * Asynchronously parse a string or readable stream of XML to a Slimdom document.
 */
export function async(xml: string | Readable, options?: Options): Promise<Document> {
	return new Promise((resolve, reject) => {
		// Set up the sax parser
		const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
		const parser = new saxes.SaxesParser(mergedOptions);
		const handler = createHandler(parser, mergedOptions);

		// Bind the handler functions to saxes events
		parser.on('attribute', handler.onAttribute);
		parser.on('cdata', handler.onCdata);
		parser.on('closetag', handler.onCloseTag);
		parser.on('comment', handler.onComment);
		parser.on('doctype', handler.onDocType);
		parser.on('error', error => {
			reject(error);
		});
		parser.on('opentag', handler.onOpenTag);
		parser.on('opentagstart', handler.onOpenTagStart);
		parser.on('processinginstruction', handler.onProcessingInstruction);
		parser.on('text', handler.onText);

		// Handle additionalEntities
		if (options !== undefined && options.additionalEntities !== undefined) {
			for (const [entity, entityValue] of Object.entries(options.additionalEntities)) {
				parser.ENTITIES[entity] = entityValue;
			}
		}

		// Take input from either a string argument...
		if (typeof xml === 'string') {
			parser.write(xml).close();
			resolve(handler.document);
			return;
		}

		// Or take input from a readable string...
		if (xml instanceof Readable) {
			xml.on('readable', () => {
				let chunk;
				while ((chunk = xml.read(xml.readableHighWaterMark || 8 * 1024))) {
					parser.write(chunk);
				}
			});
			xml.on('end', () => {
				parser.close();
				resolve(handler.document);
			});
			return;
		}

		// Or throw on invalid input.
		reject(new Error(`Unsupported input type ${typeof xml}.`));
	});
}
