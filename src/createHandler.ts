import {
	AttributeHandler,
	CDataHandler,
	CloseTagHandler,
	CommentHandler,
	DoctypeHandler,
	OpenTagHandler,
	OpenTagStartHandler,
	PIHandler,
	SaxesAttributeNS,
	SaxesOptions,
	SaxesParser,
	TextHandler
} from 'saxes';
import { Document } from 'slimdom';
import createNamespaceContext from './createNamespaceContext';
import createPositionTracker, { Position, positionTrackerStubs } from './createPositionTracker';
import { parseDoctypeDeclaration } from './parseDoctypeDeclaration';

type Handler = {
	onText: TextHandler;
	onOpenTag: OpenTagHandler<SaxesOptions>;
	onOpenTagStart: OpenTagStartHandler<SaxesOptions>;
	onCloseTag: CloseTagHandler<SaxesOptions>;
	onAttribute: AttributeHandler<{ xmlns: true; position: true }>;
	onProcessingInstruction: PIHandler;
	onComment: CommentHandler;
	onDocType: DoctypeHandler;
	onCdata: CDataHandler;
	document: Document;
};

/*
 * Create the required callbacks for populating a new document from sax event handlers
 */
export default function createHandler(parser: SaxesParser, options: SaxesOptions): Handler {
	// A new XML DOM object that has the same API as the browser DOM implementation, but isomorphic and supports
	// namespaces.
	const document = new Document();

	// The node into which new child nodes are inserted. Is rewritten as the handler traverses in and out of elements.
	let contextNode: any = document;

	// Helpers for other responsibilities
	const namespaces = createNamespaceContext(options.additionalNamespaces || {});

	const {
		trackNodePosition,
		trackNodeClosePosition,
		updateLastTrackedPosition,
		getCurrentPosition,
		trackAttributePosition
	} = options.position ? createPositionTracker(parser) : positionTrackerStubs;

	let attributePositions: Map<string, Position> = new Map();

	// Return a bunch of methods that can be applied directly to a saxes parser instance.
	return {
		onText: text => {
			if (contextNode === document) {
				updateLastTrackedPosition();
				return;
			}
			const textNode = trackNodePosition(document.createTextNode(text));
			contextNode.appendChild(textNode);
		},

		onOpenTag: element => {
			// More namespace declarations might be applicable
			if (element.ns) {
				namespaces.push(element.ns);
			}
			const nsLocation = namespaces.location(element.prefix);
			if (nsLocation === undefined) {
				throw new Error(`Could not resolve a namespace location for "${element.prefix}"`);
			}
			const node = trackNodePosition(document.createElementNS(nsLocation, element.name));

			Object.keys(element.attributes)
				.map(name => element.attributes[name])
				.forEach((attr: string | SaxesAttributeNS) => {
					if (typeof attr === 'string') {
						// @TODO Find out why saxes sometimes uses strings instead of SaxesAttributeNs
						return;
					}

					// Default namespace declarations do not apply to attributes, so if an attribute
					// is not prefixed the namespace location is null
					let namespaceURI = attr.prefix === '' ? null : namespaces.location(attr.prefix);

					// @xmlns has no prefix but is in the XMLNS namespace
					if (attr.prefix === '' && attr.name === 'xmlns') {
						namespaceURI = namespaces.location('xmlns');
					}

					const position = attributePositions.get(attr.name)!;
					const attributeNode = trackAttributePosition(
						document.createAttributeNS(namespaceURI!, attr.name),
						position
					);
					attributeNode.value = attr.value;
					node.setAttributeNode(attributeNode);
				});

			contextNode.appendChild(node);
			contextNode = node;
		},

		onOpenTagStart: () => {
			attributePositions = new Map();
		},

		onAttribute: attribute => {
			attributePositions.set(attribute.name, getCurrentPosition());
		},

		onCloseTag: () => {
			// Update position tracking so that the closing tag of an element is not prepended to the following sibling
			trackNodeClosePosition(contextNode);

			if (!contextNode.parentNode) {
				throw new Error('End of the line!');
			}

			// Any traversal from now on is within a higher context element
			contextNode = contextNode.parentNode;

			// Less namespace declarations might now be applicable
			namespaces.pop();
		},

		onProcessingInstruction: pi => {
			contextNode.appendChild(
				trackNodePosition(document.createProcessingInstruction(pi.target, pi.body))
			);
		},

		onComment: comment => {
			contextNode.appendChild(trackNodePosition(document.createComment(comment)));
		},

		onDocType: data => {
			const { qualifiedName, publicId, systemId } = parseDoctypeDeclaration(
				`<!DOCTYPE ${data}>`
			);
			contextNode.appendChild(
				trackNodePosition(
					document.implementation.createDocumentType(
						qualifiedName,
						publicId || '',
						systemId || ''
					)
				)
			);
		},

		onCdata: string => {
			contextNode.appendChild(trackNodePosition(document.createCDATASection(string)));
		},

		document: document
	};
}
