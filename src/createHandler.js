const slimdom = require('slimdom');

const createPositionTracker = require('./createPositionTracker');
const createNamespaceContext = require('./createNamespaceContext');

/*
 * Create the required callbacks for populating a new document from sax event handlers
 */
module.exports = function createHandler(parser, options) {
	// A new XML DOM object that has the same API as the browser DOM implementation, but isomorphic and supports
	// namespaces.
	const document = new slimdom.Document();

	// The node into which new child nodes are inserted. Is rewritten as the handler traverses in and out of elements.
	let contextNode = document;

	// Helpers for other responsibilities
	const namespaces = createNamespaceContext();

	const track = options.position ? createPositionTracker(parser) : (node) => node;

	// Return a bunch of methods that can be applied directly to a saxes parser instance.
	return {
		onText: (text) => {
			if (contextNode === document) {
				track();
				return;
			}
			const textNode = track(document.createTextNode(text));
			contextNode.appendChild(textNode);
		},

		onOpenTag: (element) => {
			// More namespace declarations might be applicable
			namespaces.push(element.ns);

			const node = track(document.createElementNS(namespaces.location(element.prefix), element.name));

			// Set attributes, taking the accumulated namespace information into account
			Object.keys(element.attributes).map((name) => element.attributes[name]).forEach((attr) => {
				// Default namespace declarations do not apply to attributes, so if an attribute
				// is not prefixed the namespace location is null
				let namespaceURI = attr.prefix === '' ? null : namespaces.location(attr.prefix);

				// @xmlns has no prefix but is in the XMLNS namespace
				if (attr.prefix === '' && attr.name === 'xmlns') {
					namespaceURI = namespaces.location('xmlns');
				}

				node.setAttributeNS(namespaceURI, attr.name, attr.value);
			});

			contextNode.appendChild(node);
			contextNode = node;
		},

		onCloseTag: () => {
			// Update position tracking so that the closing tag of an element is not prepended to the following sibling
			track();

			// Any traversal from now on is within a higher context element
			contextNode = contextNode.parentNode;

			// Less namespace declarations might now be applicable
			namespaces.pop();
		},

		onProcessingInstruction: (pi) => {
			contextNode.appendChild(track(document.createProcessingInstruction(pi.target, pi.body)));
		},

		onComment: (comment) => {
			contextNode.appendChild(track(document.createComment(comment)));
		},

		onDocType: (data) => {
			const [ qualifiedName, _publicSystem, publicId, systemId ] = data.match(/(?:[^\s"]+|"[^"]*")+/g);

			contextNode.appendChild(
				track(
					document.implementation.createDocumentType(
						qualifiedName,
						(publicId && publicId.replace(/^"(.*)"$/, '$1')) || '',
						(systemId && systemId.replace(/^"(.*)"$/, '$1')) || ''
					)
				)
			);
		},

		onCdata: (string) => {
			contextNode.appendChild(track(document.createCDATASection(string)));
		},

		getDocument: () => {
			return document;
		}
	};
};
