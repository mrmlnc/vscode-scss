'use strict';

import { SymbolInformation, SymbolKind } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import type StorageService from '../services/storage';
import type { ISymbols } from '../types/symbols';
import { getSymbolsCollection } from '../utils/symbols';

export async function searchWorkspaceSymbol(
	query: string,
	storage: StorageService,
	root: string
): Promise<SymbolInformation[]> {
	const workspaceSymbols: SymbolInformation[] = [];

	getSymbolsCollection(storage).forEach(symbols => {
		if (symbols.filepath === undefined) {
			return;
		}

		const documentUri = URI.file(symbols.filepath);
		if (!documentUri.fsPath.includes(root)) {
			return;
		}

		const types: Array<keyof ISymbols> = ['variables', 'mixins', 'functions'];

		types.forEach(type => {
			let kind = SymbolKind.Variable;
			if (type === 'mixins') {
				kind = SymbolKind.Function as any;
			} else if (type === 'functions') {
				kind = SymbolKind.Interface as any;
			}

			if (type === 'imports') {
				return;
			}

			for (const symbol of symbols[type]) {
				if (!symbol.name.includes(query) || symbol.position === undefined) {
					continue;
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
			}
		});
	});

	return workspaceSymbols;
}
