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
		{ name: 'one', parameters: [], offset: 0, position: null },
		{ name: 'two', parameters: [], offset: 0, position: null },
		{
			name: 'two',
			parameters: [
				{ name: '$a', value: null, offset: 0 }
			],
			offset: 0,
			position: null
		},
		{
			name: 'two',
			parameters: [
				{ name: '$a', value: null, offset: 0 },
				{ name: '$b', value: null, offset: 0 }
			],
			offset: 0,
			position: null
		}
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: null }
	],
	imports: []
});

describe('Providers/SignatureHelp - Empty', () => {

	it('Empty', () => {
		const doc = makeDocument('@include one(');
		assert.equal(doSignatureHelp(doc, 13, cache, settings).signatures.length, 1);
	});
	it('Closed without parameters', () => {
		const doc = makeDocument('@include two()');
		assert.equal(doSignatureHelp(doc, 13, cache, settings).signatures.length, 3);
	});

	it('Closed with parameters', () => {
		const doc = makeDocument('@include two(1);');
		assert.equal(doSignatureHelp(doc, 16, cache, settings).signatures.length, 0);
	});

});

describe('Providers/SignatureHelp - Two parameters', () => {

	it('Passed one parameter of two', () => {
		const doc = makeDocument('@include two(1,');
		const signature = doSignatureHelp(doc, 15, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('Passed two parameter of two', () => {
		const doc = makeDocument('@include two(1, 2,');
		const signature = doSignatureHelp(doc, 18, cache, settings);

		assert.equal(signature.activeParameter, 2, 'activeParameter');
		assert.equal(signature.signatures.length, 1, 'signatures.length');
	});

	it('Passed three parameters of two', () => {
		const doc = makeDocument('@include two(1, 2, 3,');
		const signature = doSignatureHelp(doc, 21, cache, settings);

		assert.equal(signature.signatures.length, 0);
	});

	it('Passed two parameter of two with parenthesis', () => {
		const doc = makeDocument('@include two(1, 2)');
		const signature = doSignatureHelp(doc, 18, cache, settings);

		assert.equal(signature.signatures.length, 0);
	});

});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Mixins', () => {

	it('RGBA', () => {
		const doc = makeDocument('@include two(rgba(0,0,0,.0001),');
		const signature = doSignatureHelp(doc, 31, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('RGBA when typing', () => {
		const doc = makeDocument('@include two(rgba(0,0,0,');
		const signature = doSignatureHelp(doc, 24, cache, settings);

		assert.equal(signature.activeParameter, 0, 'activeParameter');
		assert.equal(signature.signatures.length, 3, 'signatures.length');
	});

	it('Quotes', () => {
		const doc = makeDocument('@include two("\\",;",');
		const signature = doSignatureHelp(doc, 20, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('With overload', () => {
		const doc = makeDocument('@include two(');
		assert.equal(doSignatureHelp(doc, 13, cache, settings).signatures.length, 3);
	});

	it('Single-line selector', () => {
		const doc = makeDocument('h1 { @include two(1, }');
		assert.equal(doSignatureHelp(doc, 20, cache, settings).signatures.length, 2);
	});

	it('Single-line Mixin reference', () => {
		const doc = makeDocument('h1 { @include two(1, 2); @include two(1,) }');
		assert.equal(doSignatureHelp(doc, 40, cache, settings).signatures.length, 2);
	});

	it('Mixin with named argument', () => {
		const doc = makeDocument('@include two($a: 1,');
		assert.equal(doSignatureHelp(doc, 19, cache, settings).signatures.length, 2);
	});

});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Functions', () => {

	it('Empty', () => {
		const doc = makeDocument('content: make(');
		assert.equal(doSignatureHelp(doc, 14, cache, settings).signatures.length, 1);
	});

	it('Inside another function', () => {
		const doc = makeDocument('content: attr(make(');
		assert.equal(doSignatureHelp(doc, 19, cache, settings).signatures.length, 1);
	});

	it('Inside another function with CSS function', () => {
		const doc = makeDocument('background-color: make(rgba(');
		assert.equal(doSignatureHelp(doc, 28, cache, settings).signatures.length, 1);
	});

	it('Inside another function with uncompleted CSS function', () => {
		const doc = makeDocument('background-color: make(rgba(1, 1,2,');
		assert.equal(doSignatureHelp(doc, 35, cache, settings).signatures.length, 1);
	});

	it('Inside another function with completed CSS function', () => {
		const doc = makeDocument('background-color: make(rgba(1,2, 3,.5)');
		assert.equal(doSignatureHelp(doc, 38, cache, settings).signatures.length, 1);
	});

});
