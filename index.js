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
 * @returns {slimdom.Document}
 */
exports.sync = function synchronousSlimdomSaxParser(xml, options = DEFAULT_OPTIONS) {
	// Set up the sax parser
	const parser = new saxes.SaxesParser(options);

	const handler = createHandler(parser, options);

	parser.ontext = handler.onText;
	parser.onopentag = handler.onOpenTag;
	parser.onclosetag = handler.onCloseTag;
	parser.onprocessinginstruction = handler.onProcessingInstruction;
	parser.oncomment = handler.onComment;
	parser.ondoctype = handler.onDocType;
	parser.onopencdata = handler.onOpenCdata;
	parser.oncdata = handler.onCdata;
	parser.onclosecdata = handler.onCloseCdata;

	parser.write(xml).close();

	return handler.getDocument();
};
