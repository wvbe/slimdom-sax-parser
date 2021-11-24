import { SaxesParser } from 'saxes';
import { Attr, Node } from 'slimdom';

/**
 * The helper functions to track node positions.
 */
type PositionTracker = {
	trackNodePosition<N extends Node>(node: N): PositionTrackedNode<N>;
	trackNodeClosePosition<N extends Node>(node: PositionTrackedNode<N>): PositionTrackedElement<N>;
	updateLastTrackedPosition(): void;
	getCurrentPosition(): Position;
	trackAttributePosition<A extends Attr>(attr: A, endPosition: Position): PositionTrackedAttr<A>;
};

/**
 * One (collapsed) location in code. `offset` is equal to the length of all preceding lines + column.
 */
export type Position = {
	offset: number;
	line: number;
	column: number;
};

/**
 * A location in code, possibly spanning text. `start` and `end` are both offsets from the start of
 * the XML source.
 */
export type PositionRange = {
	line: number;
	column: number;
	start: number;
	end: number;
};

/**
 * Various properties on nodes that contain the position information.
 */
export type PositionTrackedNode<N> = N & {
	position: PositionRange;
};
export type PositionTrackedElement<N> = PositionTrackedNode<N> & {
	closePosition: PositionRange;
};
export type PositionTrackedAttr<A> = A & {
	position: {
		end: number;
	};
};

/**
 * The DOM node types enumeration. Only TEXT_NODE and COMMENT_NODE are used, so the rest is commented out.
 *
 * See also:
 *   https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 */
const types = {
	// ELEMENT_NODE: 1,
	// ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	// CDATA_SECTION_NODE: 4,
	// ENTITY_REFERENCE_NODE: 5,
	// ENTITY_NODE: 6,
	// PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8
	// DOCUMENT_NODE: 9,
	// DOCUMENT_TYPE_NODE: 10,
	// DOCUMENT_FRAGMENT_NODE: 11,
	// NOTATION_NODE: 12
};

/**
 * Create the context needed to track the positions in an XML string at which a Slimdom node was defined. Is based on
 * input from the saxes parser and fixes some unexpected behaviour by it.
 */
export default function createPositionTracker(parser: SaxesParser): PositionTracker {
	let lastTrackedPosition = {
		// Line and column numbers are 1-based
		line: 1,
		column: 1,

		// Offset (start + end) are 0-based
		offset: 0
	};

	function updateLastTrackedPosition(): void {
		lastTrackedPosition = getCurrentPosition();
	}

	// Fixes some quirky results from saxes' position tracking:
	// - XML comments were always one character short
	function getCurrentPosition<N extends Node>(node?: N) {
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
			// the opening tag of the next sibling element or closing tag would show up in the text substr.
			// Therefore fix endPosition by not counting the next element or closing tag.
			position.offset--;
			position.column--;
		} else if (node.nodeType === types.COMMENT_NODE) {
			// For XML comments the position tracking is always received one character too short.
			// This right here is a local fix, and rather crude.
			position.offset++;
			position.column++;
		}

		return position;
	}

	// Updates the tracker with new input from the saxes parser, and writes a "position" property to the DOM node
	// that was passed.
	function trackNodePosition<N extends Node>(node: N): PositionTrackedNode<N> {
		const endPosition = getCurrentPosition(node);

		(node as PositionTrackedNode<N>).position = {
			line: lastTrackedPosition.line,
			column: lastTrackedPosition.column,
			start: lastTrackedPosition.offset,
			end: endPosition.offset
		};

		lastTrackedPosition = endPosition;

		return node as PositionTrackedNode<N>;
	}

	function trackNodeClosePosition<N extends Node>(node: PositionTrackedNode<N>) {
		const endPosition = getCurrentPosition(node);

		(node as PositionTrackedElement<N>).closePosition = {
			line: lastTrackedPosition.line,
			column: lastTrackedPosition.column,
			start: lastTrackedPosition.offset,
			end: endPosition.offset
		};

		lastTrackedPosition = endPosition;

		return node as PositionTrackedElement<N>;
	}

	function trackAttributePosition<A extends Attr>(
		attr: A,
		endPosition: Position
	): PositionTrackedAttr<A> {
		(attr as PositionTrackedAttr<A>).position = {
			end: endPosition.offset
		};

		return attr as PositionTrackedAttr<A>;
	}

	return {
		getCurrentPosition,
		trackAttributePosition,
		trackNodeClosePosition,
		trackNodePosition,
		updateLastTrackedPosition
	};
}

/**
 * No-op alternative for position tracking, when position tracking is disabled.
 */
export const positionTrackerStubs: PositionTracker = {
	getCurrentPosition: () => ({ offset: 0, line: 0, column: 0 }),
	trackAttributePosition: (attr?: any) => attr,
	trackNodeClosePosition: (node?: any) => node,
	trackNodePosition: (node?: any) => node,
	updateLastTrackedPosition: () => {}
};
