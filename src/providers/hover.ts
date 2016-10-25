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
import { getParentNodeByType } from '../utils/ast';

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
		value: `${symbol.name}: ${value}` + suffix
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

		for (let i = 0; i < symbolsByType.length; i++) {
			if (symbolsByType[i].name === identifier.name) {
				return {
					document: symbols.document,
					path: fsPath,
					info: symbolsByType[i]
				};
			}
		}
	}

	return null;
}

/**
 * Do Hover :)
 */
export function doHover(document: TextDocument, offset: number, cache: ICache, settings: ISettings): Hover {
	const documentPath = Files.uriToFilePath(document.uri) || document.uri;
	if (!documentPath) {
		return null;
	}

	const resource = parseDocument(document, offset, settings);
	const hoverNode = resource.ast;
	if (!hoverNode || !hoverNode.type) {
		return;
	}

	const symbolsList = getSymbolsCollection(cache).concat(resource.symbols);

	let identifier: { type: string; name: string; } = null;
	if (hoverNode.type === NodeType.VariableName) {
		identifier = {
			name: hoverNode.getName(),
			type: 'variables'
		};
	} else if (hoverNode.type === NodeType.Identifier) {
		let node = getParentNodeByType(hoverNode, NodeType.MixinReference) || getParentNodeByType(hoverNode, NodeType.MixinDeclaration);

		if (node) {
			identifier = {
				name: node.getName(),
				type: 'mixins'
			};
		} else {
			node = getParentNodeByType(hoverNode, NodeType.FunctionDeclaration);

			if (node) {
				identifier = {
					name: node.getName(),
					type: 'functions'
				};
			}
		}
	}

	if (!identifier) {
		return;
	}

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
