const sax = require('sax');
const slimdom = require('slimdom');

function createHandler () {
	const doc = new slimdom.Document();
	let dom = doc;

	return {
		onText: (text) => {
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

		getDocument: () => {
			return doc;
		}
	};
}

module.exports = {
	slimdom,

	/**
	 * @param {string} xml
	 * @param {Boolean} [strict]
	 * @param {Object} [options]
	 * @returns {slimdom.Document}
	 */
	sync: function synchronousSlimdomSaxParser (xml, strict, options) {
		const handler = createHandler();

		// Set up the sax parser
		const parser = sax.parser(strict, options);
		parser.ontext = handler.onText;
		parser.onopentag = handler.onOpenTag;
		parser.onclosetag = handler.onCloseTag;
		parser.onprocessinginstruction = handler.onProcessingInstruction;
		parser.oncomment = handler.onComment;
		parser.ondoctype = handler.onDocType;

		// Parse and return
		parser.write(xml).close();
		return handler.getDocument();
	}
};
