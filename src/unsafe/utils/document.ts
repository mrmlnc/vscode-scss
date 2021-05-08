'use strict';

import * as path from 'path';

import type { DocumentContext } from 'vscode-css-languageservice';

/**
 * Returns the path to the document, relative to the current document.
 */
export function getDocumentPath(currentPath: string, symbolsPath: string | undefined): string {
	if (symbolsPath === undefined) {
		throw new Error("Unexpected behaviour. The 'symbolsPath' argument is undefined.");
	}

	const rootUri = path.dirname(currentPath);
	const docPath = path.relative(rootUri, symbolsPath);

	if (docPath === path.basename(currentPath)) {
		return 'current';
	}

	return docPath.replace(/\\/g, '/');
}

/**
 * Primary copied from the original VSCode CSS extension:
 * https://github.com/microsoft/vscode/blob/2bb6cfc16a88281b75cfdaced340308ff89a849e/extensions/css-language-features/server/src/utils/documentContext.ts
 */
export function buildDocumentContext(base: string): DocumentContext {
	return {
		resolveReference: ref => new URL(ref, base).toString()
	};
}
