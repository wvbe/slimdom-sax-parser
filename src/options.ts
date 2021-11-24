import * as saxes from 'saxes';

export interface Options extends saxes.SaxesOptions {
	additionalEntities?: {
		[entityName: string]: string;
	};
}

export const DEFAULT_OPTIONS: Options = {
	xmlns: true,
	position: false,
	additionalEntities: {}
};
