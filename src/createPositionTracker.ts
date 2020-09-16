import { SaxesParser } from 'saxes';
import { Node } from 'slimdom';

export type PositionTrackedNode = Node & {
	position: {
		line: number;
		column: number;
		start: number;
		end: number;
	};
};

export type PositionUpdater = () => void;

export type PositionTracker = (node: Node) => PositionTrackedNode;

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

/**
 * Create the context needed to track the positions in an XML string at which a Slimdom node was defined. Is based on
 * input from the saxes parser and fixes some unexpected behaviour by it.
 */
export default function createPositionTracker(
	parser: SaxesParser
): [PositionTracker, PositionUpdater] {
	let lastTrackedPosition = {
		// Line and column numbers are 1-based
		line: 1,
		column: 1,

		// Offset (start + end) are 0-based
		offset: 0
	};

	// Fixes some quirky results from saxes' position tracking:
	// - XML comments were always one character short
	function getNextPosition(node?: Node) {
		const position = {
			offset: parser.position,
			line: parser.line,
			column: parser.column + 1
		};

		if (!node) {
			return position;
		}

		if (node.nodeType === types.TEXT_NODE) {
			// For XML text nodes the position tracking is always received when the next node is instantiated, eg.
			// the opening tag of the next sibling element would show up in the text substr.
			// Therefore fix endPosition by calculating it from the text thats actually in the node.
			const wholeText = node.textContent || '';
			const wholeTextNewlines = wholeText.match(/\n/g);

			position.offset = lastTrackedPosition.offset + wholeText.length;
			position.line =
				lastTrackedPosition.line + (wholeTextNewlines ? wholeTextNewlines.length : 0);
			position.column = wholeTextNewlines
				? wholeText.substr(wholeText.lastIndexOf('\n')).length
				: lastTrackedPosition.column + wholeText.length;
		}

		if (node.nodeType === types.COMMENT_NODE) {
			// For XML comments the position tracking is always received one character too short.
			// This right here is a local fix, and rather crude.
			position.offset++;
			position.column++;
		}

		return position;
	}

	function update(): void {
		const endPosition = getNextPosition();

		lastTrackedPosition = endPosition;
	}

	// Updates the tracker with new input from the saxes parser, and writes a "position" property to the DOM node
	// that was passed.
	function track(node: Node): PositionTrackedNode {
		const endPosition = getNextPosition(node);

		(<PositionTrackedNode>node).position = {
			line: lastTrackedPosition.line,
			column: lastTrackedPosition.column,
			start: lastTrackedPosition.offset,
			end: endPosition.offset
		};

		lastTrackedPosition = endPosition;

		return <PositionTrackedNode>node;
	}

	return [track, update];
}

/**
 * No-op alternative for position tracking, when position tracking is disabled.
 */
export const positionTrackerStubs = [
	// Stub track()
	(node?: any) => node,
	// Stub update()
	() => {}
];
