'use strict';

import { ISymbols } from '../types/symbols';

export interface ICache {
	has: (uri: string) => boolean;
	get: (uri: string) => ISymbols;
	set: (uri: string, symbols: ISymbols) => void;
	drop: (uri: string) => void;
	dispose: () => void;
	storage: () => any;
	keys: () => string[];
}

/**
 * Returns Cache storage.
 */
export function getCacheStorage(): ICache {
	let storage: any = {};

	return {
		has: (uri: string) => {
			return storage.hasOwnProperty(uri);
		},
		get: (uri: string) => {
			return storage[uri] || null;
		},
		set: (uri: string, symbols: ISymbols) => {
			storage[uri] = symbols;
		},
		drop: (uri: string) => {
			if (storage.hasOwnProperty(uri)) {
				delete storage[uri];
			}
		},
		dispose: () => {
			storage = {};
		},
		storage: () => storage,
		keys: () => Object.keys(storage)
	};
}

/**
 * Cache invalidation. Removes items from the Cache when they are no longer available.
 */
export function invalidateCacheStorage(cache: ICache, symbolsList: ISymbols[]): void {
	Object.keys(cache.storage()).forEach((item) => {
		for (let i = 0; i < symbolsList.length; i++) {
			if (item === symbolsList[i].document) {
				return;
			}
		}

		cache.drop(item);
	});
}
