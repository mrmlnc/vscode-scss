'use strict';

import { ISymbols } from '../types/symbols';
import { ICache } from '../services/cache';

/**
 * Returns Symbols from all documents.
 */
export function getSymbolsCollection(cache: ICache): ISymbols[] {
	return cache.keys().map((filepath) => cache.get(filepath));
}
