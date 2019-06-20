const saxes = require('saxes');
const slimdom = require('slimdom');

const DEFAULT_OPTIONS = {
	xmlns: true,
	position: false
};

const DEFAULT_NS_MAPPING = {
	'': null,
	'xml': 'http://www.w3.org/XML/1998/namespace',
	'xmlns': 'http://www.w3.org/2000/xmlns/'
};

const types = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12
};
/*
 * Create the required callbacks for populating a new document from sax event handlers
 */
function createHandler(parser, options) {
	const doc = new slimdom.Document();

	// Is rewritten as the handler traverses in and out of nodes
	let node = doc;

	const namespaces = [DEFAULT_NS_MAPPING];
	let currentNamespaces = Object.create(DEFAULT_NS_MAPPING);

	let lastTrackedPosition = {
		line: 0, column: 0, offset: 0
	}

	const trackedPosition = options.position ?
		node => {
			const endPosition = { line: parser.line, column: parser.column, offset: parser.position };
			if (node) {
				node.position = {
					start: { ...lastTrackedPosition },
					end: {...endPosition}
				};
			}

			lastTrackedPosition = endPosition;
			return node;
		} :
		node => node;

	return {
		onText: (text) => {
			node.appendChild(trackedPosition(doc.createTextNode(text)));
		},

		onOpenTag: (element) => {
			// More namespace declarations might be applicable
			namespaces.push(element.ns);
			currentNamespaces = Object.assign(currentNamespaces, element.ns);

			const instance = trackedPosition(doc.createElementNS(currentNamespaces[element.prefix], element.name));

			// Set attributes, taking the accumulated namespace information into account
			Object.keys(element.attributes)
				.map(name => element.attributes[name])
				.forEach(attr => {
					let namespaceURI = attr.prefix === '' ? null : currentNamespaces[attr.prefix];
					// Default namespace declarations have no prefix but are in the XMLNS namespace
					if (attr.prefix === '' && attr.name === 'xmlns') {
						namespaceURI = currentNamespaces['xmlns'];
					}

					instance.setAttributeNS(namespaceURI, attr.name, attr.value);
				});

			node.appendChild(instance);
			node = instance;
		},

		onCloseTag: () => {
			node = node.parentNode;

			// Less namespace declarations might be applicable
			namespaces.pop();

			// Recalculate the (subset) portion of known namespace information
			currentNamespaces = namespaces.reduce((accum, ns) => Object.assign(accum, ns), {});
		},

		onProcessingInstruction: (pi) => {
			if (pi.target === 'xml' && node.nodeType === node.DOCUMENT_NODE) {
				trackedPosition();
				return;
			}
			node.appendChild(trackedPosition(doc.createProcessingInstruction(pi.target, pi.body)));
		},

		onComment: (comment) => {
			node.appendChild(trackedPosition(doc.createComment(comment)));
		},

		onDocType: (data) => {
			const [
				qualifiedName,
				_publicSystem,
				publicId,
				systemId
			] = data.match(/(?:[^\s"]+|"[^"]*")+/g);

			node.appendChild(trackedPosition(doc.implementation.createDocumentType(
				qualifiedName,
				publicId && publicId.replace(/^"(.*)"$/, '$1') || '',
				systemId && systemId.replace(/^"(.*)"$/, '$1') || ''
			)));
		},

		onCdata: (string) => {
			node.appendChild(trackedPosition(doc.createCDATASection(string)));
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
 * @returns {slimdom.Document}
 */
exports.sync = function synchronousSlimdomSaxParser(xml, options) {
	options = {
		...DEFAULT_OPTIONS,
		...options
	};

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
