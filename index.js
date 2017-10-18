const sax = require('sax');
const slimdom = require('slimdom');

/*
 * Create the required callbacks for populating a new document from sax event handlers
 */
function createHandler () {
	const doc = new slimdom.Document();
	let dom = doc;
	let cdata = null;

	return {
		onText: (text) => {
			if (dom.nodeType === slimdom.Node.DOCUMENT_NODE) {
				return;
			}
			dom.appendChild(doc.createTextNode(text));
		},

		onOpenTag: (node) => {
			dom = dom.appendChild(doc.createElement(node.name));

			Object.keys(node.attributes)
				.forEach(name => dom.setAttribute(name, node.attributes[name]));
		},

		onCloseTag: () => {
			dom = dom.parentNode
		},

		onProcessingInstruction: (pi) => {
			dom.appendChild(doc.createProcessingInstruction(pi.name, pi.body));
		},

		onComment: (comment) => {
			dom.appendChild(doc.createComment(comment));
		},

		onDocType: (data) => {
			const [
				qualifiedName,
				_publicSystem,
				publicId,
				systemId
			] = data.match(/(?:[^\s"]+|"[^"]*")+/g);

			dom.appendChild(doc.implementation.createDocumentType(
				qualifiedName,
				publicId && publicId.replace(/^"(.*)"$/, '$1') || '',
				systemId && systemId.replace(/^"(.*)"$/, '$1') || ''
			));
		},

		onOpenCdata: () => {
			cdata = '';
		},
		onCdata: (string) => {
			cdata += string;
		},
		onCloseCdata: () => {
			dom.appendChild(doc.createCDATASection(cdata));
			cdata = null;
		},

		getDocument: () => {
			return doc;
		}
	};
}

/*
 * Export the API of slimdom-sax-parser
 */
exports.slimdom = slimdom;

/**
 * Synchronously parse a string of XML to a Slimdom document
 * @param {string} xml
 * @param {Boolean} [strict]
 * @param {Object} [options]
 * @returns {slimdom.Document}
 */
exports.sync = function synchronousSlimdomSaxParser (xml, strict, options) {
	const handler = createHandler();

	// Set up the sax parser
	const parser = sax.parser(strict, options);
	parser.ontext = handler.onText;
	parser.onopentag = handler.onOpenTag;
	parser.onclosetag = handler.onCloseTag;
	parser.onprocessinginstruction = handler.onProcessingInstruction;
	parser.oncomment = handler.onComment;
	parser.ondoctype = handler.onDocType;
	parser.onopencdata = handler.onOpenCdata;
	parser.oncdata = handler.onCdata;
	parser.onclosecdata = handler.onCloseCdata;

	// Parse and return
	parser.write(xml).close();
	return handler.getDocument();
};
