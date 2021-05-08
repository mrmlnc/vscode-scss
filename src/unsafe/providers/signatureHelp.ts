'use strict';

import { SignatureHelp, SignatureInformation } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { tokenizer } from 'scss-symbols-parser';

import type { IVariable } from '../types/symbols';
import type StorageService from '../services/storage';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getTextBeforePosition } from '../utils/string';
import { hasInFacts } from '../utils/facts';

// RegExp's
const reNestedParenthesis = /\(([\w-]+)\(/;
const reSymbolName = /[\w-]+$/;

interface IMixinEntry {
	name: string | null;
	parameters: number;
}

/**
 * Returns name of last Mixin or Function in the string.
 */
function getSymbolName(text: string): string | null | undefined {
	const tokens = tokenizer(text);
	let pos = tokens.length;
	let token: [string, string, string];
	let parenthesisCount = 0;

	while (pos !== 0) {
		pos--;
		token = tokens[pos];

		// Return first `word` token before `(` because it's Symbols name
		if (token[0] === '(') {
			// Skip nested parenthesis
			parenthesisCount--;
			if (parenthesisCount > -1) {
				continue;
			}

			// String can be contains built-in Functions such as `rgba` or `map`
			while (pos !== 0) {
				pos--;
				token = tokens[pos];

				if (token[0] === 'word' && !hasInFacts(token[1])) {
					const match = reSymbolName.exec(token[1]);
					return match ? match[0] : null;
				}
			}
		} else if (token[0] === ')') {
			parenthesisCount++;
		} else if (token[0] === 'brackets' && reNestedParenthesis.test(token[1])) {
			// Tokens for nested string with correct positions
			const nestedTokens = tokenizer(token[1]).map(x => {
				if (x.length === 3) {
					x[2] = x[2] + token[2];
				}
				return x;
			});

			// Replace the current token on a new collection
			tokens.splice(pos, 1, ...nestedTokens);
			// Revert position back on length of nested tokens
			pos = pos + nestedTokens.length;
		}
	}

	return null;
}

/**
 * Returns Mixin name and its parameters from line.
 */
function parseArgumentsAtLine(text: string): IMixinEntry {
	text = text.trim();
	if (text.includes('{')) {
		text = text.slice(text.indexOf('{') + 1, text.length).trim();
	}

	// Try to find name of Mixin or Function
	const name = getSymbolName(text);

	let paramsString = '';
	if (name) {
		const start = text.lastIndexOf(name + '(') + name.length;
		paramsString = text.slice(start, text.length);
	}

	let parameters = 0;
	if (paramsString.substr(1).length !== 0) {
		const tokens = tokenizer(paramsString);

		if (tokens.length === 1 && tokens[0][0] === 'brackets') {
			return {
				name: null,
				parameters
			};
		}

		let pos = 0;
		let token;
		let parenthesis = -1;

		while (pos < tokens.length) {
			token = tokens[pos];

			if (token[1] === ',' || token[1] === ';') {
				parameters++;
			} else if (token[0] === 'word' && token[1] !== ',' && token[1].includes(',') && parenthesis === 0) {
				const words: string[] = token[1].split(/(,)/);

				let index = pos;
				words.forEach(word => {
					if (word === '') {
						return;
					}

					tokens.splice(index, 1, word === ',' ? [',', ',', 0] : ['word', word, 0]);
					index++;
				});
			} else if (token[0] === '(') {
				parenthesis++;
			} else if (token[0] === ')') {
				parenthesis--;
			}
			pos++;
		}
	}

	return {
		name: name ? name : null,
		parameters
	};
}

export async function doSignatureHelp(
	document: TextDocument,
	offset: number,
	storage: StorageService
): Promise<SignatureHelp> {
	const suggestions: { name: string; parameters: IVariable[] }[] = [];

	const ret: SignatureHelp = {
		activeSignature: 0,
		activeParameter: 0,
		signatures: []
	};

	// Skip suggestions if the text not include `(` or include `);`
	const textBeforeWord = getTextBeforePosition(document.getText(), offset);
	if (textBeforeWord.endsWith(');') || !textBeforeWord.includes('(')) {
		return ret;
	}

	const entry = parseArgumentsAtLine(textBeforeWord);
	if (!entry.name) {
		return ret;
	}

	const symbolType = textBeforeWord.indexOf('@include') !== -1 ? 'mixins' : 'functions';

	const resource = await parseDocument(document, offset);

	storage.set(document.uri, resource.symbols);

	getSymbolsCollection(storage).forEach(symbols => {
		symbols[symbolType].forEach(symbol => {
			if (entry.name === symbol.name && symbol.parameters.length >= entry.parameters) {
				suggestions.push({
					name: symbol.name,
					parameters: symbol.parameters
				});
			}
		});
	});

	if (suggestions.length === 0) {
		return ret;
	}

	ret.activeParameter = Math.max(0, entry.parameters);

	suggestions.forEach(mixin => {
		const paramsString = mixin.parameters.map(x => `${x.name}: ${x.value}`).join(', ');
		const signatureInfo = SignatureInformation.create(`${mixin.name} (${paramsString})`);

		mixin.parameters.forEach(param => {
			signatureInfo.parameters?.push({
				label: param.name,
				documentation: ''
			});
		});

		ret.signatures.push(signatureInfo);
	});

	return ret;
}
