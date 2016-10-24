'use strict';

import * as path from 'path';

import { ISymbols } from '../types/symbols';

/**
 * Returns imports for document.
 */
export function getCurrentDocumentImportPaths(symbolsList: ISymbols[], currentPath: string): string[] {
	for (let i = 0; i < symbolsList.length; i++) {
		if (symbolsList[i].document === currentPath) {
			return symbolsList[i].imports.map((x) => x.filepath);
		}
	}

	return [];
}

/**
 * Returns the path to the document, relative to the current document.
 */
export function getDocumentPath(currentPath: string, symbolsPath: string): string {
	const rootUri = path.dirname(currentPath);
	const docPath = path.relative(rootUri, symbolsPath);

	if (docPath === path.basename(currentPath)) {
		return 'current';
	}

	return docPath.replace(/\\/g, '/');
}
