'use strict';

import * as path from 'path';
import * as url from 'url';

import { DocumentContext } from 'vscode-css-languageservice';
import { URI } from 'vscode-uri';
import { fileExistsSync } from '../utils/fs';

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

/**
 * Primary copied from the original VSCode CSS extension:
 * https://github.com/microsoft/vscode/blob/2bb6cfc16a88281b75cfdaced340308ff89a849e/extensions/css-language-features/server/src/utils/documentContext.ts
 */
export function buildDocumentContext(base: string): DocumentContext {
	return {
		resolveReference: ref => {
			// Following [css-loader](https://github.com/webpack-contrib/css-loader#url)
			// And [sass-loader's](https://github.com/webpack-contrib/sass-loader#imports)
			// Convention, if an import path starts with ~ then use node module resolution
			// *unless* it starts with "~/" as this refers to the user's home directory.
			if (ref[0] === '~' && ref[1] !== '/') {
				ref = ref.substring(1);

				if (base.startsWith('file:')) {
					const moduleName = getModuleNameFromPath(ref);
					const modulePath = resolvePathToModule(moduleName, base);

					if (modulePath) {
						return url.resolve(modulePath, ref);
					}
				}
			}

			return url.resolve(base, ref);
		}
	};
}

export function getModuleNameFromPath(filepath: string) {
	/**
	 * If a scoped module (starts with @) then get up until second instance of '/',
	 * otherwise get until first instance of '/'.
	 */
	if (filepath[0] === '@') {
		return filepath.substring(0, filepath.indexOf('/', filepath.indexOf('/') + 1));
	}

	return filepath.substring(0, filepath.indexOf('/'));
}

export function resolvePathToModule(moduleName: string, relativeTo: string): string | undefined {
	const documentFolder = path.dirname(URI.parse(relativeTo).fsPath);
	const packageDirectory = path.join(documentFolder, 'node_modules', moduleName);

	if (fileExistsSync(packageDirectory)) {
		return URI.file(packageDirectory).toString();
	}

	return undefined;
}
