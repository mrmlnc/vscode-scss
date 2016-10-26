'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doSignatureHelp } from '../../providers/signatureHelp';

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	suggestMixins: true,
	suggestVariables: true
};

function makeDocument(lines: string | string[]) {
	return TextDocument.create('test.scss', 'scss', 1, Array.isArray(lines) ? lines.join('\n') : lines);
}

const cache = getCacheStorage();

cache.set('one.scss', {
	document: 'one.scss',
	variables: [],
	mixins: [
		{ name: 'one', parameters: [], offset: 0 },
		{ name: 'two', parameters: [], offset: 0 },
		{
			name: 'two',
			parameters: [
				{ name: '$a', value: null, offset: 0 }
			],
			offset: 0
		},
		{
			name: 'two',
			parameters: [
				{ name: '$a', value: null, offset: 0 },
				{ name: '$b', value: null, offset: 0 }
			],
			offset: 0
		}
	],
	functions: [],
	imports: []
});

describe('Providers/SignatureHelp', () => {

	it('doSignatureHelp - Empty', () => {
		const doc = makeDocument('@include one(');
		assert.equal(doSignatureHelp(doc, 13, cache, settings).signatures.length, 1);
	});

	it('doSignatureHelp - Closed', () => {
		const doc = makeDocument('@include two(1);');
		assert.equal(doSignatureHelp(doc, 16, cache, settings), null);
	});

	it('doSignatureHelp - Two parameters', () => {
		const doc = makeDocument('@include two(1,');
		const signature = doSignatureHelp(doc, 15, cache, settings);

		assert.equal(signature.activeParameter, 1);
		assert.equal(signature.signatures.length, 1);
	});

	it('doSignatureHelp - RGBA', () => {
		const doc = makeDocument('@include two(rgba(0,0,0,0),');
		const signature = doSignatureHelp(doc, 27, cache, settings);

		assert.equal(signature.activeParameter, 1);
		assert.equal(signature.signatures.length, 1);
	});

	it('doSignatureHelp - Quotes', () => {
		const doc = makeDocument('@include two("\\",;",');
		const signature = doSignatureHelp(doc, 20, cache, settings);

		assert.equal(signature.activeParameter, 1);
		assert.equal(signature.signatures.length, 1);
	});

	it('doSignatureHelp - With overload', () => {
		const doc = makeDocument('@include two(');
		assert.equal(doSignatureHelp(doc, 13, cache, settings).signatures.length, 3);
	});

});
