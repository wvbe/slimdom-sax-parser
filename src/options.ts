import * as saxes from 'https://esm.sh/saxes@6.0.0';

export interface Options extends saxes.SaxesOptions {
	additionalEntities?: {
		[entityName: string]: string;
	};
}

export const DEFAULT_OPTIONS: Options = {
	xmlns: true,
	position: false,
	additionalEntities: {},
};
