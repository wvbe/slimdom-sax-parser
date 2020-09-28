import * as saxes from 'saxes';

export interface SlimdomSaxParserOptions extends saxes.SaxesOptions {
	additionalEntities?: {
		[entityName: string]: string;
	};
}

export const DEFAULT_OPTIONS: SlimdomSaxParserOptions = {
	xmlns: true,
	position: false,
	additionalEntities: {}
};
