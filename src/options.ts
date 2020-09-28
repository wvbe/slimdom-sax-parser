import * as saxes from 'saxes';

export interface SlimdomSaxParserOptions extends saxes.SaxesOptions {
	/**
	 * Prefix/URI mapping of namespaces that are not declared in XML.
	 */
	additionalEntities?: {
		[entityName: string]: string;
	};

	/**
	 * A filter callback for filtering out parts of the XML contents while parsing. When a tag is
	 * filtered, all of its descendants are as well. Not that the first argument is a saxesTag
	 * object, while the second argument is a slimdom/XML object. The former is just a plain object
	 * without ascendant or descendant, while the latter can be queried using, for example,
	 * FontoXPath.
	 */
	tagFilter?: (elementTag: saxes.SaxesTag, contextNode: any) => boolean;
}

export const DEFAULT_OPTIONS: SlimdomSaxParserOptions = {
	xmlns: true,
	position: false,
	additionalEntities: {}
};
