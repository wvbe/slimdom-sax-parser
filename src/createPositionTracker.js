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

// Create the context needed to track the positions in an XML string at which a Slimdom node was defined. Is based
// on input from the saxes parser and fixes some unexpected behaviour by it.
module.exports = function createPositionTracker(parser) {
	let lastTrackedPosition = {
		line: 0,
		column: 0,
		offset: 0
	};

	// Fixes some quirky results from saxes' position tracking:
	// - XML comments were always one character short
	// - text node boundaries were not the text length
	// Also, currently uses only an offset, because the line/column numbers can be easily calculated if you need them.
	function getNextPosition(node) {
		const position = {
			offset: parser.position

			// Uncomment to track lines/columns:
			// line: parser.line,
			// column: parser.column
		};

		if (!node) {
			return position;
		}

		if (node.nodeType === types.TEXT_NODE) {
			// For XML text nodes the position tracking is always received when the next node is instantiated, eg.
			// the opening tag of the next sibling element would show up in the text substr.
			// Therefore fix endPosition by calculating it from the text thats actually in the node.
			const wholeText = node.wholeText;
			position.offset = lastTrackedPosition.offset + wholeText.length;

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
			position.offset++;

			// Uncomment to track lines/columns:
			// endPosition.column++;
		}

		return position;
	}

	// Updates the tracker with new input from the saxes parser, and writes a "position" property to the DOM node
	// that was passed.
	function track(node) {
		const endPosition = getNextPosition(node);

		if (node) {
			node.position = {
				start: lastTrackedPosition.offset,
				end: endPosition.offset

				// Uncomment to track lines/columns:
				// start: lastTrackedPosition,
				// end: endPosition
			};
		}

		lastTrackedPosition = endPosition;

		return node;
	}

	return track;
};
