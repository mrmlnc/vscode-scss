'use strict';

import { ISymbols } from '../types/symbols';
import StorageService from '../services/storage';

/**
 * Returns Symbols from all documents.
 */
export function getSymbolsCollection(storage: StorageService): ISymbols[] {
	return storage.values();
}

export function getSymbolsRelatedToDocument(storage: StorageService, current: string): ISymbols[] {
	return getSymbolsCollection(storage).filter(item => item.document !== current || item.filepath !== current);
}
