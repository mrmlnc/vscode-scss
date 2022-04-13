'use strict';

import { Hover, MarkupContent, MarkupKind } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { NodeType } from '../types/nodes';
import type { IDocumentSymbols, IVariable, IMixin, IFunction, ISymbols } from '../types/symbols';
import type StorageService from '../services/storage';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getDocumentPath } from '../utils/document';
import { getLimitedString } from '../utils/string';
import { applySassDoc} from './sassdoc';

type Identifier = { type: keyof ISymbols; name: string };

async function formatVariableMarkupContent(symbol: ISymbol, suffix: string): Promise<MarkupContent> {
	const variable = symbol.info as IVariable;
	const fsPath = symbol.path;
	const value = getLimitedString(variable.value || '');
	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	const sassdoc = await applySassDoc(symbol, "variable");

	return {
		kind: MarkupKind.Markdown,
		value: [
			'```scss',
			`${sassdoc}${variable.name}: ${value};${suffix}`,
			'```'
		].join('\n')
	};
}

async function formatMixinMarkupContent(symbol: ISymbol, suffix: string): Promise<MarkupContent> {
	const mixin = symbol.info as IMixin;
	const fsPath = symbol.path;
	const args = mixin.parameters.map(item => `${item.name}: ${item.value}`).join(', ');

	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	const sassdoc = await applySassDoc(symbol, "mixin");

	return {
		kind: MarkupKind.Markdown,
		value: [
			'```scss',
			`${sassdoc}@mixin ${mixin.name}(${args}) {\u2026}${suffix}`,
			'```'
		].join('\n')
	}
}

async function formatFunctionMarkupContent(symbol: ISymbol, suffix: string): Promise<MarkupContent> {
	const func = symbol.info as IFunction;
	const fsPath = symbol.path;
	const args = func.parameters.map(item => `${item.name}: ${item.value}`).join(', ');

	if (fsPath !== 'current') {
		suffix = `\n@import "${fsPath}"` + suffix;
	}

	const sassdoc = await applySassDoc(symbol, "function");

	return {
		kind: MarkupKind.Markdown,
		value: [
			'```scss',
			`${sassdoc}@function ${func.name}(${args}) {\u2026}${suffix}`,
			'```'
		].join('\n')
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

	storage.set(document.uri, resource.symbols);

	const symbolsList = getSymbolsCollection(storage);
	const documentImports = resource.symbols.imports.map(x => x.filepath);
	const symbol = getSymbol(symbolsList, identifier, documentPath);

	// Content for Hover popup
	let contents: MarkupContent | undefined;
	if (symbol && symbol.document !== undefined) {
		// Add 'implicitly' suffix if the file imported implicitly
		let contentSuffix = '';
		if (symbol.path !== 'current' && symbol.document && documentImports.indexOf(symbol.document) === -1) {
			contentSuffix = ' (implicitly)';
		}

		if (identifier.type === 'variables') {
			contents = await formatVariableMarkupContent(symbol, contentSuffix);
		} else if (identifier.type === 'mixins') {
			contents = await formatMixinMarkupContent(symbol, contentSuffix);
		} else if (identifier.type === 'functions') {
			contents = await formatFunctionMarkupContent(symbol, contentSuffix);
		}
	}

	if (contents === undefined) {
		return null;
	}

	return {
		contents
	};
}
