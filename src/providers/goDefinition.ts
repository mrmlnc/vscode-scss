'use strict';

import { Location, Files } from 'vscode-languageserver';
import { TextDocument, Position } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { NodeType } from '../types/nodes';
import { ISymbols } from '../types/symbols';
import StorageService from '../services/storage';

import { parseDocument } from '../services/parser';
import { getSymbolsRelatedToDocument } from '../utils/symbols';
import { getDocumentPath } from '../utils/document';

interface ISymbol {
	document: string;
	path: string;
	info: any;
}

interface IIdentifier {
	type: string;
	position: Position;
	name: string;
}

function samePosition(a: Position, b: Position) {
	return a.line === b.line && a.character === b.character;
}

/**
 * Returns the Symbol, if it present in the documents.
 */
function getSymbols(symbolList: ISymbols[], identifier: IIdentifier, currentPath: string): ISymbol[] {
	const list: ISymbol[] = [];

	symbolList.forEach(symbols => {
		const fsPath = getDocumentPath(currentPath, symbols.document);

		symbols[identifier.type].forEach(item => {
			if (item.name === identifier.name && !samePosition(item.position, identifier.position)) {
				list.push({
					document: symbols.filepath,
					path: fsPath,
					info: item
				});
			}
		});
	});

	return list;
}

export async function goDefinition(document: TextDocument, offset: number, storage: StorageService): Promise<Location> {
	const documentPath = Files.uriToFilePath(document.uri) || document.uri;
	if (!documentPath) {
		return null;
	}

	const resource = await parseDocument(document, offset);
	const hoverNode = resource.node;
	if (!hoverNode || !hoverNode.type) {
		return null;
	}

	let identifier: IIdentifier = null;
	if (hoverNode.type === NodeType.VariableName) {
		const parent = hoverNode.getParent();
		if (parent.type !== NodeType.FunctionParameter && parent.type !== NodeType.VariableDeclaration) {
			identifier = {
				name: hoverNode.getName(),
				position: document.positionAt(hoverNode.offset),
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
				position: document.positionAt(node.offset),
				type
			};
		}
	}

	if (!identifier) {
		return null;
	}

	storage.set(resource.symbols.document, resource.symbols);

	const symbolsList = getSymbolsRelatedToDocument(storage, documentPath);

	// Symbols
	const candidates = getSymbols(symbolsList, identifier, documentPath);
	if (candidates.length === 0) {
		return null;
	}

	const definition = candidates[0];

	const symbol = Location.create(URI.file(definition.document).toString(), {
		start: definition.info.position,
		end: {
			line: definition.info.position.line,
			character: definition.info.position.character + definition.info.name.length
		}
	});

	return symbol;
}
