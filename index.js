const sax = require('sax');
const slimdom = require('slimdom');

/*
 * Create the required callbacks for populating a new document from sax event handlers
 */
function createHandler () {
	const doc = new slimdom.Document();
	let dom = doc;
	let cdata = null;

	const namespaces = [{ '': null }];
	let currentNamespaces = { '': null };

	function pushAccumulatedNamespaceInfo (node) {
		const localNamespaces = Object.keys(node.attributes)
			.filter(name => name.indexOf('xmlns') === 0);

		if (!localNamespaces.length) {
			// No new namespace info discovered, so exit without doing much else
			namespaces.push(null);
			return;
		}

		// Reduce array to a prefix-to-url mapping
		const localNamespaceMapping = localNamespaces
			.reduce((accum, name) => Object.assign(accum, {
				[name.split(':')[1] || '']: node.attributes[name]
			}), {});

		// Push to array so the entire namespace info can be popped and recalculated entirely
		namespaces.push(localNamespaceMapping);

		// Assign the local namespace mapping onto what we already knew
		currentNamespaces = Object.assign(currentNamespaces, localNamespaceMapping);
	}

	function popAccumulatedNamespaceInfo () {
		if (!namespaces.pop()) {
			// The namespace info for the level that is popped was empty, so exit early
			return;
		}

		// Recalculate the (subset) portion of known namespace information
		currentNamespaces = namespaces.reduce((accum, ns) => Object.assign(accum, ns), {});
	}

	return {
		onText: (text) => {
			if (dom.nodeType === slimdom.Node.DOCUMENT_NODE) {
				// Do not add text directly to document node (aka. outside document element)
				return;
			}
			dom.appendChild(doc.createTextNode(text));
		},

		onOpenTag: (node) => {
			pushAccumulatedNamespaceInfo(node);

			const prefix = node.name.includes(':') ? node.name.substr(0, node.name.indexOf(':')) : '';
			if (currentNamespaces[prefix] === undefined) {
				throw new Error('Namespace prefix "' + prefix + '" not known for element ' + node.name);
			}

			dom = dom.appendChild(doc.createElementNS(currentNamespaces[prefix], node.name));

			// Set attributes, taking the accumulated namespace information into account
			Object.keys(node.attributes)
				.filter(name => name !== 'xmlns' && name.indexOf('xmlns:') !== 0)
				.forEach(name => {
					const prefix = name.includes(':') ? name.substr(0, name.indexOf(':')) : null;
					if (prefix !== null && currentNamespaces[prefix] === undefined) {
						throw new Error('Namespace prefix "' + prefix + '" not known for attribute ' + name);
					}

					if (prefix === null) {
						dom.setAttribute(name, node.attributes[name]);
					}
					else {
						dom.setAttributeNS(currentNamespaces[prefix], name, node.attributes[name]);
					}
			});
		},

		onCloseTag: () => {
			dom = dom.parentNode;

			popAccumulatedNamespaceInfo();
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
