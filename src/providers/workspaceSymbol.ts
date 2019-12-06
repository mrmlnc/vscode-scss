'use strict';

import { SymbolInformation, SymbolKind } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import StorageService from '../services/storage';
import { getSymbolsCollection } from '../utils/symbols';

export async function searchWorkspaceSymbol(
	query: string,
	storage: StorageService,
	root: string
): Promise<SymbolInformation[]> {
	const workspaceSymbols: SymbolInformation[] = [];

	getSymbolsCollection(storage).forEach(symbols => {
		const documentUri = URI.file(symbols.filepath);
		if (!documentUri.fsPath.includes(root)) {
			return;
		}

		['variables', 'mixins', 'functions'].forEach(type => {
			let kind = SymbolKind.Variable;
			if (type === 'mixins') {
				kind = SymbolKind.Function as any;
			} else if (type === 'functions') {
				kind = SymbolKind.Interface as any;
			}

			symbols[type].forEach(symbol => {
				if (!symbol.name.includes(query)) {
					return;
				}

				workspaceSymbols.push({
					name: symbol.name,
					kind,
					location: {
						uri: documentUri.toString(),
						range: {
							start: symbol.position,
							end: {
								line: symbol.position.line,
								character: symbol.position.character + symbol.name.length
							}
						}
					}
				});
			});
		});
	});

	return workspaceSymbols;
}
