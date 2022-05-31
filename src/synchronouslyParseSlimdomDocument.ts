import * as saxes from 'https://esm.sh/saxes@6.0.0';

import { DEFAULT_OPTIONS, Options } from './options.ts';
import createHandler from './createHandler.ts';

/**
 * Synchronously parse a string of XML to a Slimdom document.
 */
export function sync(xml: string, options?: Options) {
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

	parser.write(xml).close();

	return handler.document;
}
