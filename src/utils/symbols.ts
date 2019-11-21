'use strict';

import { ISymbols } from '../types/symbols';
import StorageService from '../services/storage';

/**
 * Returns Symbols from all documents.
 */
export function getSymbolsCollection(storage: StorageService): ISymbols[] {
	return storage.values();
}
