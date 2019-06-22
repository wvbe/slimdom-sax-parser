const DEFAULT_NS_MAPPING = {
	'': null,
	'xml': 'http://www.w3.org/XML/1998/namespace',
	'xmlns': 'http://www.w3.org/2000/xmlns/'
};

// Records an array of overlapping objects that is shifted and unshifted as the parser traverses.
module.exports = function createNamespaceContext(defaultNsMapping = DEFAULT_NS_MAPPING) {
	const namespaces = [defaultNsMapping];

	return {
		// pop and push are actually shift and unshift to make searches more efficient
		push: x => namespaces.unshift(x),
		pop: () => namespaces.shift(),

		// Get the location associated with a prefix
		location: prefix => namespaces.find(ns => ns[prefix] !== undefined)[prefix]
	}
}