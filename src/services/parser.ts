'use strict';

import * as path from 'path';

import { TextDocument, Files } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { IDocument, ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';

import { findSymbols, findSymbolsAtOffset } from '../parser/symbols';
import { getNodeAtOffset } from '../utils/ast';

interface LocatePath {
	(files: string[], options?: Partial<{ concurrency: number; preserveOrder: boolean; cwd: string; }>): Promise<string | undefined>;
	sync(files:string[], options?: Partial<{ cwd: string; }>): string | undefined;
}

const locatePath: LocatePath = require('locate-path');

// RegExp's
const reReferenceCommentGlobal = /\/\/\s*<reference\s*path=["'](.*)['"]\s*\/?>/g;
const reReferenceComment = /\/\/\s*<reference\s*path=["'](.*)['"]\s*\/?>/;
const reDynamicPath = /#{}\*/;

// SCSS Language Service
const ls = getSCSSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

/**
 * Returns all Symbols in a single document.
 */
export function parseDocument(root: string, document: TextDocument, offset: number = null, settings: ISettings): IDocument {
	let symbols: ISymbols;
	try {
		symbols = findSymbols(document.getText());
	} catch (err) {
		if (settings.showErrors) {
			throw err;
		}

		symbols = {
			variables: [],
			mixins: [],
			functions: [],
			imports: []
		};
	}

	// Set path for document in Symbols collection
	symbols.document = Files.uriToFilePath(document.uri) || document.uri;

	// Get `<reference *> comments from document
	const references = document.getText().match(reReferenceCommentGlobal);
	if (references) {
		references.forEach((x) => {
			const filepath = reReferenceComment.exec(x)[1];
			symbols.imports.push({
				css: filepath.substr(-4) === '.css',
				dynamic: reDynamicPath.test(filepath),
				filepath: filepath,
				reference: true
			});
		});
	}

	let ast: INode = null;
	if (offset) {
		ast = <INode>ls.parseStylesheet(document);

		const scopedSymbols = findSymbolsAtOffset(ast, offset);

		symbols.variables = symbols.variables.concat(scopedSymbols.variables);
		symbols.mixins = symbols.mixins.concat(scopedSymbols.mixins);
	}

	symbols.imports = symbols.imports.map((x) => {
		let relativePath = x.filepath;
		if (!x.css && relativePath.substr(-5) !== '.scss') {
			relativePath += '.scss';
		}

		x.filepath = findFirstScssFile(relativePath, { root, settings, documentPath: path.dirname(symbols.document) });
		return x;
	});

	symbols.variables = symbols.variables.map((x) => {
		x.position = document.positionAt(x.offset);
		return x;
	});
	symbols.mixins = symbols.mixins.map((x) => {
		x.position = document.positionAt(x.offset);
		return x;
	});
	symbols.functions = symbols.functions.map((x) => {
		x.position = document.positionAt(x.offset);
		return x;
	});

	return {
		symbols,
		node: offset ? getNodeAtOffset(ast, offset) : null
	};
}

export function getPossiblePaths(filepath: string) {
	const targets = [filepath];

	const basename = path.basename(filepath);
	if (!basename.startsWith('_')) {
		targets.push(path.resolve(path.dirname(filepath), '_' + basename));
	}

	return targets;
}

export function findFirstScssFile(relativePath: string, {root, settings, documentPath}: { root: string; settings: ISettings; documentPath: string }) {
	const targets = getPossiblePaths(path.resolve(documentPath, relativePath));

	for (const includePath of settings.includePaths || []) {
		targets.push(...getPossiblePaths(path.resolve(root, includePath, relativePath)));
	}

	return locatePath.sync(targets);
}
