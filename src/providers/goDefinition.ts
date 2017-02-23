'use strict';

import {
	TextDocument,
	Location,
	Files
} from 'vscode-languageserver';
import Uri from 'vscode-uri';

import { NodeType } from '../types/nodes';
import { ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';
import { ICache } from '../services/cache';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getDocumentPath } from '../utils/document';

interface ISymbol {
	document: string;
	path: string;
	info: any;
}

/**
 * Returns the Symbol, if it present in the documents.
 */
function getSymbols(symbolList: ISymbols[], identifier: any, currentPath: string): ISymbol[] {
	const list: ISymbol[] = [];

	symbolList.forEach((symbols) => {
		const fsPath = getDocumentPath(currentPath, symbols.document);

		symbols[identifier.type].forEach((item) => {
			if (item.name === identifier.name) {
				list.push({
					document: symbols.document,
					path: fsPath,
					info: item
				});
			}
		});
	});

	return list;
}

/**
 * Do Go Definition :)
 */
export function goDefinition(root: string, document: TextDocument, offset: number, cache: ICache, settings: ISettings): Location[] {
	const documentPath = Files.uriToFilePath(document.uri) || document.uri;
	if (!documentPath) {
		return [];
	}

	const resource = parseDocument(root, document, offset, settings);
	const hoverNode = resource.node;
	if (!hoverNode || !hoverNode.type) {
		return [];
	}

	let identifier: { type: string; name: string; } = null;
	if (hoverNode.type === NodeType.VariableName) {
		const parent = hoverNode.getParent();
		if (parent.type !== NodeType.FunctionParameter && parent.type !== NodeType.VariableDeclaration) {
			identifier = {
				name: hoverNode.getName(),
				type: 'variables'
			};
		}
	} else if (hoverNode.type === NodeType.Identifier) {
		let i = 0;
		let node = hoverNode;
		while (node.type !== NodeType.MixinReference && node.type !== NodeType.Function && i !== 2) {
			node = node.getParent();
			i++;
		}

		if (node && (node.type === NodeType.MixinReference || node.type === NodeType.Function)) {
			let type = 'mixins';
			if (node.type === NodeType.Function) {
				type = 'functions';
			}

			identifier = {
				name: node.getName(),
				type
			};
		}
	}

	if (!identifier) {
		return [];
	}

	// Symbols from Cache
	const symbolsList = getSymbolsCollection(cache).concat(resource.symbols);

	// Symbols
	const candidates = getSymbols(symbolsList, identifier, documentPath);
	if (candidates.length === 0) {
		return [];
	}

	return candidates.map((x) => {
		return Location.create(Uri.file(x.document).toString(), {
			start: x.info.position,
			end: {
				line: x.info.position.line,
				character: x.info.position.character + x.info.name.length
			}
		});
	});
}
