'use strict';

import {
	Hover,
	MarkedString,
	TextDocument,
	Files
} from 'vscode-languageserver';

import { NodeType } from '../types/nodes';
import { ISymbols, IVariable, IMixin, IFunction } from '../types/symbols';
import { ISettings } from '../types/settings';
import { ICache } from '../services/cache';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getCurrentDocumentImportPaths, getDocumentPath } from '../utils/document';
import { getLimitedString } from '../utils/string';

/**
 * Returns a colored (marked) line for Variable.
 */
function makeVariableAsMarkedString(symbol: IVariable, fsPath: string, suffix: string): MarkedString {
	const value = getLimitedString(symbol.value);
	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	return {
		language: 'scss',
		value: `${symbol.name}: ${value};` + suffix
	};
}

/**
 * Returns a colored (marked) line for Mixin.
 */
function makeMixinAsMarkedString(symbol: IMixin, fsPath: string, suffix: string): MarkedString {
	const args = symbol.parameters.map((item) => `${item.name}: ${item.value}`).join(', ');

	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	return {
		language: 'scss',
		value: '@mixin ' + symbol.name + `(${args}) {\u2026}` + suffix
	};
}

/**
 * Returns a colored (marked) line for Function.
 */
function makeFunctionAsMarkedString(symbol: IFunction, fsPath: string, suffix: string): MarkedString {
	const args = symbol.parameters.map((item) => `${item.name}: ${item.value}`).join(', ');

	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	return {
		language: 'scss',
		value: '@function ' + symbol.name + `(${args}) {\u2026}` + suffix
	};
}

interface ISymbol {
	document: string;
	path: string;
	info: any;
}

/**
 * Returns the Symbol, if it present in the documents.
 */
function getSymbol(symbolList: ISymbols[], identifier: any, currentPath: string): ISymbol {
	for (let i = 0; i < symbolList.length; i++) {
		const symbols = symbolList[i];
		const symbolsByType = symbols[identifier.type];

		const fsPath = getDocumentPath(currentPath, symbols.document);

		for (let j = 0; j < symbolsByType.length; j++) {
			if (symbolsByType[j].name === identifier.name) {
				return {
					document: symbols.document,
					path: fsPath,
					info: symbolsByType[j]
				};
			}
		}
	}

	return null;
}

/**
 * Do Hover :)
 */
export function doHover(root: string, document: TextDocument, offset: number, cache: ICache, settings: ISettings): Hover {
	const documentPath = Files.uriToFilePath(document.uri) || document.uri;
	if (!documentPath) {
		return null;
	}

	const resource = parseDocument(root, document, offset, settings);
	const hoverNode = resource.node;
	if (!hoverNode || !hoverNode.type) {
		return;
	}

	let identifier: { type: string; name: string; } = null;
	if (hoverNode.type === NodeType.VariableName) {
		const parent = hoverNode.getParent();

		if (parent.type !== NodeType.VariableDeclaration && parent.type !== NodeType.FunctionParameter) {
			identifier = {
				name: hoverNode.getName(),
				type: 'variables'
			};
		}
	} else if (hoverNode.type === NodeType.Identifier) {
		let node;
		let type;

		const parent = hoverNode.getParent();
		if (parent.type === NodeType.Function) {
			node = parent;
			type = 'functions';
		} else if (parent.type === NodeType.MixinReference) {
			node = parent;
			type = 'mixins';
		}

		if (node) {
			identifier = {
				name: node.getName(),
				type
			};
		}
	} else if (hoverNode.type === NodeType.MixinReference) {
		identifier = {
			name: hoverNode.getName(),
			type: 'mixins'
		};
	}

	if (!identifier) {
		return;
	}

	// Update Cache for current document
	cache.set(documentPath, resource.symbols);
	// Symbols from Cache
	const symbolsList = getSymbolsCollection(cache);
	// Imports for current document
	const documentImports = getCurrentDocumentImportPaths(symbolsList, documentPath);
	// All symbols
	const symbol = getSymbol(symbolsList, identifier, documentPath);

	// Content for Hover popup
	let contents: MarkedString = '';
	if (symbol) {
		// Add 'implicitly' suffix if the file imported implicitly
		let contentSuffix = '';
		if (symbol.path !== 'current' && documentImports.indexOf(symbol.document) === -1) {
			contentSuffix = ' (implicitly)';
		}

		if (identifier.type === 'variables') {
			contents = makeVariableAsMarkedString(symbol.info, symbol.path, contentSuffix);
		} else if (identifier.type === 'mixins') {
			contents = makeMixinAsMarkedString(symbol.info, symbol.path, contentSuffix);
		} else if (identifier.type === 'functions') {
			contents = makeFunctionAsMarkedString(symbol.info, symbol.path, contentSuffix);
		}
	}

	return {
		contents
	};
}
