'use strict';

import * as path from 'path';

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
