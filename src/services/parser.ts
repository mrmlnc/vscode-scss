'use strict';

import * as path from 'path';

import { TextDocument, Files } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { IDocument, ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';

import { findSymbols, findSymbolsAtOffset } from '../parser/symbols';
import { getNodeAtOffset } from '../utils/ast';

// RegExp's
const reReferenceCommentGlobal = /\/\/\s*<reference\s*path=["'](.*)['"]\s*\/?>/g;
const reReferenceComment = /\/\/\s*<reference\s*path=["'](.*)['"]\s*\/?>/;
const reDynamicPath = /#{}\*/;

// SCSS Language Service
const ls = getSCSSLanguageService();

ls.configure({
	validate: false
});

/**
 * Returns all Symbols in a single document.
 */
export function parseDocument(document: TextDocument, offset: number = null, settings: ISettings): IDocument {
	const symbols: ISymbols = {
		...getDocumentSymbols(document, settings),
		document: Files.uriToFilePath(document.uri) || document.uri,
		filepath: Files.uriToFilePath(document.uri) || document.uri
	};

	// Get `<reference *> comments from document
	const references = document.getText().match(reReferenceCommentGlobal);
	if (references) {
		references.forEach(x => {
			const filepath = reReferenceComment.exec(x)[1];
			symbols.imports.push({
				css: filepath.substr(-4) === '.css',
				dynamic: reDynamicPath.test(filepath),
				filepath,
				reference: true
			});
		});
	}

	let ast: INode = null;
	if (offset) {
		ast = ls.parseStylesheet(document) as INode;

		const scopedSymbols = findSymbolsAtOffset(ast, offset);

		symbols.variables = symbols.variables.concat(scopedSymbols.variables);
		symbols.mixins = symbols.mixins.concat(scopedSymbols.mixins);
	}

	symbols.imports = symbols.imports.map(x => {
		if (x.filepath[0] === '~') {
			x.filepath = 'node_modules/' + x.filepath.slice(1);
		}
		x.filepath = path.join(path.dirname(symbols.document), x.filepath);
		if (!x.css && x.filepath.substr(-5) !== '.scss') {
			x.filepath += '.scss';
		}
		return x;
	});

	symbols.variables = symbols.variables.map(x => {
		x.position = document.positionAt(x.offset);
		return x;
	});
	symbols.mixins = symbols.mixins.map(x => {
		x.position = document.positionAt(x.offset);
		return x;
	});
	symbols.functions = symbols.functions.map(x => {
		x.position = document.positionAt(x.offset);
		return x;
	});

	return {
		symbols,
		node: offset ? getNodeAtOffset(ast, offset) : null
	};
}

function getDocumentSymbols(document: TextDocument, settings: ISettings): ISymbols {
	try {
		return findSymbols(document.getText());
	} catch (err) {
		if (settings.showErrors) {
			throw err;
		}

		return {
			variables: [],
			mixins: [],
			functions: [],
			imports: []
		};
	}
}
