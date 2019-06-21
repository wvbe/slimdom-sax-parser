const saxes = require('saxes');
const slimdom = require('slimdom');

const DEFAULT_OPTIONS = {
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
		function applyPositionToNode(node = {}) {
			const endPosition = {
				offset: parser.position

				// Uncomment to track lines/columns:
				// line: parser.line,
				// column: parser.column
			};

			if (node.nodeType === types.TEXT_NODE) {
				// For XML text nodes the position tracking is always received when the next node is instantiated, eg.
				// the opening tag of the next sibling element would show up in the text substr.
				// Therefore fix endPosition by calculating it from the text thats actually in the node.
				const wholeText = node.wholeText;
				endPosition.offset = lastTrackedPosition.offset + wholeText.length;

				// Uncomment to track lines/columns:
				// const wholeTextNewlines = wholeText.match(/\n/g);
				// endPosition.line = lastTrackedPosition.line + (wholeTextNewlines ? wholeTextNewlines.length : 0);
				// endPosition.column = wholeTextNewlines ?
				// 	wholeText.substr(wholeText.lastIndexOf('\n')).length :
				// 	lastTrackedPosition.column + wholeText.length;
			}

			if (node.nodeType === types.COMMENT_NODE) {
				// For XML comments the position tracking is always received one character too short.
				// This right here is a local fix, and rather crude.
				endPosition.offset++;

				// Uncomment to track lines/columns:
				// endPosition.column++;
			}

			node.position = {
				start: lastTrackedPosition.offset,
				end: endPosition.offset

				// Uncomment to track lines/columns:
				// start: lastTrackedPosition,
				// end: endPosition
			};

			lastTrackedPosition = endPosition;

			return node;
		} :
		node => node;

	return {
		onText: (text) => {
			const textNode = trackedPosition(doc.createTextNode(text));
			node.appendChild(textNode);
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
			// Update position tracking so that the closing tag of an element is not prepended to the following sibling
			trackedPosition();

			// Any traversal from now on is within a higher context element
			node = node.parentNode;

			// Less namespace declarations might now be applicable
			namespaces.pop();

			// Recalculate the (subset) portion of known namespace information
			currentNamespaces = namespaces.reduce((accum, ns) => Object.assign(accum, ns), {});
		},

		onProcessingInstruction: (pi) => {
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
exports.sync = function synchronousSlimdomSaxParser(xml, options = DEFAULT_OPTIONS) {
	// Set up the sax parser
	const parser = new saxes.SaxesParser({
		xmlns: true,
		position: options.position
	});

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
