'use strict';

import type { IDocumentSymbols } from '../types/symbols';
import type StorageService from '../services/storage';

/**
 * Returns Symbols from all documents.
 */
export function getSymbolsCollection(storage: StorageService): IDocumentSymbols[] {
	return storage.values();
}

export function getSymbolsRelatedToDocument(storage: StorageService, current: string): IDocumentSymbols[] {
	return getSymbolsCollection(storage).filter(item => item.document !== current || item.filepath !== current);
}
