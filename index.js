const saxes = require('saxes');
const slimdom = require('slimdom');

const createHandler = require('./src/createHandler');

const DEFAULT_OPTIONS = {
	xmlns: true,
	position: false
};

/*
 * Export the API of slimdom-sax-parser, as a convenience.
 */
exports.slimdom = slimdom;

/**
 * Synchronously parse a string of XML to a Slimdom document.
 * @param {string} xml
 * @param {object} options
 * @param {boolean} [options.position]  Enable position tracking, the start- and end offsets from which a DOM node was
 *                                      parsed.
 * @return {slimdom.Document}
 */
exports.sync = function synchronousSlimdomSaxParser(xml, options) {
	// Set up the sax parser
	const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, options);
	const parser = new saxes.SaxesParser(mergedOptions);

	const handler = createHandler(parser, mergedOptions);

	parser.ontext = handler.onText;
	parser.onopentag = handler.onOpenTag;
	parser.onclosetag = handler.onCloseTag;
	parser.onprocessinginstruction = handler.onProcessingInstruction;
	parser.oncomment = handler.onComment;
	parser.ondoctype = handler.onDocType;
	parser.onopencdata = handler.onOpenCdata;
	parser.oncdata = handler.onCdata;
	parser.onclosecdata = handler.onCloseCdata;

	if (options !== undefined && options.additionalEntities !== undefined) {
		for (const [entity, entityValue] of Object.entries(options.additionalEntities)) {
			parser.ENTITIES[entity] = entityValue;
		}
	}

	parser.write(xml).close();

	return handler.getDocument();
};
