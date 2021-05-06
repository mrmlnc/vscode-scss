'use strict';

import type { Hover, MarkedString } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { NodeType } from '../types/nodes';
import type { IDocumentSymbols, IVariable, IMixin, IFunction, ISymbols } from '../types/symbols';
import type StorageService from '../services/storage';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getDocumentPath } from '../utils/document';
import { getLimitedString } from '../utils/string';

type Identifier = { type: keyof ISymbols; name: string };

/**
 * Returns a colored (marked) line for Variable.
 */
function makeVariableAsMarkedString(symbol: IVariable, fsPath: string, suffix: string): MarkedString {
	const value = getLimitedString(symbol.value || '');
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
	const args = symbol.parameters.map(item => `${item.name}: ${item.value}`).join(', ');

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
	const args = symbol.parameters.map(item => `${item.name}: ${item.value}`).join(', ');

	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	return {
		language: 'scss',
		value: '@function ' + symbol.name + `(${args}) {\u2026}` + suffix
	};
}

interface ISymbol {
	document?: string;
	path: string;
	info: any;
}

/**
 * Returns the Symbol, if it present in the documents.
 */
function getSymbol(symbolList: IDocumentSymbols[], identifier: Identifier, currentPath: string): ISymbol | null {
	for (let i = 0; i < symbolList.length; i++) {
		if (identifier.type === 'imports') {
			continue;
		}

		const symbols = symbolList[i];

		if (symbols === undefined) {
			continue;
		}

		const symbolsByType = symbols[identifier.type];

		const fsPath = getDocumentPath(currentPath, symbols.filepath || symbols.document);

		for (let j = 0; j < symbolsByType.length; j++) {
			const symbol = symbolsByType[j];

			if (symbol && symbol.name === identifier.name) {
				return {
					document: symbols.document,
					path: fsPath,
					info: symbol
				};
			}
		}
	}

	return null;
}

export async function doHover(document: TextDocument, offset: number, storage: StorageService): Promise<Hover | null> {
	const documentPath = URI.parse(document.uri).fsPath;

	const resource = await parseDocument(document, offset);
	const hoverNode = resource.node;
	if (!hoverNode || !hoverNode.type) {
		return null;
	}

	let identifier: Identifier | null = null;
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
		let type: keyof ISymbols | null = null;

		const parent = hoverNode.getParent();
		if (parent.type === NodeType.Function) {
			node = parent;
			type = 'functions';
		} else if (parent.type === NodeType.MixinReference) {
			node = parent;
			type = 'mixins';
		}

		if (type === null) {
			return null;
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
		return null;
	}

	storage.set(documentPath, resource.symbols);

	const symbolsList = getSymbolsCollection(storage);
	const documentImports = resource.symbols.imports.map(x => x.filepath);
	const symbol = getSymbol(symbolsList, identifier, documentPath);

	// Content for Hover popup
	let contents: MarkedString = '';
	if (symbol && symbol.document !== undefined) {
		// Add 'implicitly' suffix if the file imported implicitly
		let contentSuffix = '';
		if (symbol.path !== 'current' && symbol.document && documentImports.indexOf(symbol.document) === -1) {
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
