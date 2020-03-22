'use strict';

import { Files } from 'vscode-languageserver';
import { SymbolKind, DocumentLink } from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { INode, NodeType } from '../types/nodes';
import { IDocument, ISymbols, IVariable, IImport } from '../types/symbols';
import { getNodeAtOffset, getParentNodeByType } from '../utils/ast';
import { buildDocumentContext } from '../utils/document';
import { getLanguageService } from '../language-service';

const reDynamicPath = /[#{}\*]/;

const ls = getLanguageService();

/**
 * Returns all Symbols in a single document.
 */
export async function parseDocument(document: TextDocument, offset: number = null): Promise<IDocument> {
	const ast = ls.parseStylesheet(document) as INode;
	const documentPath = Files.uriToFilePath(document.uri) || document.uri;

	const symbols: ISymbols = {
		document: documentPath,
		filepath: documentPath,
		...(await findDocumentSymbols(document, ast))
	};

	return {
		node: getNodeAtOffset(ast, offset),
		symbols
	};
}

async function findDocumentSymbols(document: TextDocument, ast: INode): Promise<ISymbols> {
	const symbols = ls.findDocumentSymbols(document, ast);
	const links = await findDocumentLinks(document, ast);

	const result: ISymbols = {
		functions: [],
		imports: convertLinksToImports(links),
		mixins: [],
		variables: []
	};

	for (const symbol of symbols) {
		const position = symbol.location.range.start;
		const offset = document.offsetAt(symbol.location.range.start);

		if (symbol.kind === SymbolKind.Variable) {
			result.variables.push({
				name: symbol.name,
				offset,
				position,
				value: getVariableValue(ast, offset)
			});
		} else if (symbol.kind === SymbolKind.Method) {
			result.mixins.push({
				name: symbol.name,
				offset,
				position,
				parameters: getMethodParameters(ast, offset)
			});
		} else if (symbol.kind === SymbolKind.Function) {
			result.functions.push({
				name: symbol.name,
				offset,
				position,
				parameters: getMethodParameters(ast, offset)
			});
		}
	}

	return result;
}

async function findDocumentLinks(document: TextDocument, ast: INode): Promise<DocumentLink[]> {
	// The `findDocumentLinks2` method requires URI.
	const uri = document.uri.startsWith('file:') ? document.uri : URI.file(document.uri).toString();

	const links = await ls.findDocumentLinks2(document, ast, buildDocumentContext(uri));

	return links.map(link => ({
		...link,
		target: URI.parse(link.target).fsPath
	}));
}

function getVariableValue(ast: INode, offset: number): string | null {
	const node = getNodeAtOffset(ast, offset);

	if (node === null) {
		return null;
	}

	const parent = getParentNodeByType(node, NodeType.VariableDeclaration);

	return parent?.getValue()?.getText() || null;
}

function getMethodParameters(ast: INode, offset: number): IVariable[] {
	const node = getNodeAtOffset(ast, offset);

	if (node === null) {
		return [];
	}

	return node
		.getParameters()
		.getChildren()
		.map(child => {
			const defaultValueNode = child.getDefaultValue();

			const value = defaultValueNode === undefined ? null : defaultValueNode.getText();

			return {
				name: child.getName(),
				offset: child.offset,
				value
			};
		});
}

export function convertLinksToImports(links: DocumentLink[]): IImport[] {
	return links.map(link => ({
		filepath: link.target,
		dynamic: reDynamicPath.test(link.target),
		css: link.target.endsWith('.css')
	}));
}
