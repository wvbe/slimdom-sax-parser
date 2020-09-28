import * as saxes from 'saxes';
import { DEFAULT_OPTIONS, SlimdomSaxParserOptions } from './options';
import { Document } from 'slimdom';
import { Readable } from 'stream';

import createHandler from './createHandler';

/**
 * Asynchronously parse a string or readable stream of XML to a Slimdom document.
 */
export function async(
	xml: string | Readable,
	options?: SlimdomSaxParserOptions
): Promise<Document> {
	return new Promise((resolve, reject) => {
		// Set up the sax parser
		const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
		const parser = new saxes.SaxesParser(mergedOptions);
		const handler = createHandler(parser, mergedOptions);

		parser.on('text', handler.onText);
		// xmldecl
		parser.on('processinginstruction', handler.onProcessingInstruction);
		parser.on('doctype', handler.onDocType);
		parser.on('comment', handler.onComment);
		// opentagstart
		// attribute
		parser.on('opentag', handler.onOpenTag);
		parser.on('closetag', handler.onCloseTag);
		parser.on('cdata', handler.onCdata);
		parser.on('error', error => {
			reject(error);
		});
		// end
		// ready

		// @TODO remove ths and methods on handler
		// parser.on('closecdata', handler.onCloseCdata);
		// parser.on('opencdata', handler.onOpenCdata);

		if (options !== undefined && options.additionalEntities !== undefined) {
			for (const [entity, entityValue] of Object.entries(options.additionalEntities)) {
				parser.ENTITIES[entity] = entityValue;
			}
		}

		if (typeof xml === 'string') {
			parser.write(xml).close();
			resolve(handler.document);
			return;
		} else if (xml instanceof Readable) {
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

		reject(new Error(`Unsupported input type ${typeof xml}.`));
	});
}
