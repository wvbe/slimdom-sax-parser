// import * as slimdom from 'slimdom';
import * as saxes from 'saxes';

import createHandler from './createHandler';

export interface SlimdomSaxParserOptions extends saxes.SaxesOptions {
	additionalEntities?: {
		[entityName: string]: string;
	};
}

export const DEFAULT_OPTIONS: SlimdomSaxParserOptions = {
	xmlns: true,
	position: false,
	additionalEntities: {}
};

/**
 * Synchronously parse a string of XML to a Slimdom document.
 */
export function sync(xml: string, options?: SlimdomSaxParserOptions) {
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
	// error
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

	parser.write(xml).close();

	return handler.document;
}
