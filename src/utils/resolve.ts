import * as EnhancedResolve from 'enhanced-resolve';
import { ISettings } from '../types/settings';

let resolver = EnhancedResolve.create.sync({
	extensions: ['.scss', '.css']
});

export function changeResolverAlias(setting: ISettings) {
	resolver = EnhancedResolve.create.sync({
		extensions: ['.scss', '.css'],
		alias: setting.aliasPaths
	});
}

export function resolve(base: string, ref: string) {
	return resolver(base, ref);
}
