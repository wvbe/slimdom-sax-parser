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
		getDocument: () => {
			return doc;
		}
	};
}

// function createStream (strict, options) {
// 	const stream = sax.createStream(strict, options);
// 	const handler = createHandler();
//
// 	stream.on('opentag', ding.onOpenTag);
// 	stream.on('closetag', ding.onCloseTag);
// 	stream.on('text', ding.onText);
//
// 	//...
// }

module.exports = {
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

		// Parse and return
		parser.write(xml).close();
		return handler.getDocument();
	}
};
