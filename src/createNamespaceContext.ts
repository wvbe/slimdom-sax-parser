const DEFAULT_NS_MAPPING: Record<string, string | null> = {
	'': null,
	xml: 'http://www.w3.org/XML/1998/namespace',
	xmlns: 'http://www.w3.org/2000/xmlns/'
};

/**
 * Records an array of overlapping objects that is shifted and unshifted as the parser traverses.
 */
export default function createNamespaceContext(additionalNsMapping: Record<string, string>) {
	const namespaces: Record<string, string | null>[] = [DEFAULT_NS_MAPPING];
	if (additionalNsMapping !== undefined) {
		namespaces.unshift(additionalNsMapping);
	}

	return {
		// pop and push are actually shift and unshift to make searches more efficient
		push: (x: Record<string, string>) => namespaces.unshift(x),

		pop: () => namespaces.shift(),

		// Get the location associated with a prefix
		location: (prefix: string | undefined): string | null | undefined =>
			prefix === undefined
				? prefix
				: namespaces.find(ns => ns[prefix] !== undefined)?.[prefix]
	};
}
