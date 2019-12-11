'use strict';

import * as assert from 'assert';

import { SignatureHelp } from 'vscode-languageserver';

import StorageService from '../../services/storage';
import { doSignatureHelp } from '../../providers/signatureHelp';
import * as helpers from '../helpers';

const storage = new StorageService();

storage.set('one.scss', {
	document: 'one.scss',
	filepath: 'one.scss',
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
		{ name: 'make', parameters: [], offset: 0, position: null },
		{
			name: 'one',
			parameters: [
				{ name: '$a', value: null, offset: 0 },
				{ name: '$b', value: null, offset: 0 },
				{ name: '$c', value: null, offset: 0 }
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
	imports: []
});

function getSignatureHelp(lines: string[]): SignatureHelp {
	const text = lines.join('\n');

	const document = helpers.makeDocument(text);
	const settings = helpers.makeSettings();
	const offset = text.indexOf('|');

	return doSignatureHelp(document, offset, settings, storage);
}

describe('Providers/SignatureHelp - Empty', () => {
	it('Empty', () => {
		const actual = getSignatureHelp(['@include one(|']);

		assert.equal(actual.signatures.length, 1);
	});
	it('Closed without parameters', () => {
		const actual = getSignatureHelp(['@include two(|)']);

		assert.equal(actual.signatures.length, 3);
	});

	it('Closed with parameters', () => {
		const actual = getSignatureHelp(['@include two(1);']);

		assert.equal(actual.signatures.length, 0);
	});
});

describe('Providers/SignatureHelp - Two parameters', () => {
	it('Passed one parameter of two', () => {
		const actual = getSignatureHelp(['@include two(1,|']);

		assert.equal(actual.activeParameter, 1, 'activeParameter');
		assert.equal(actual.signatures.length, 2, 'signatures.length');
	});

	it('Passed two parameter of two', () => {
		const actual = getSignatureHelp(['@include two(1, 2,|']);

		assert.equal(actual.activeParameter, 2, 'activeParameter');
		assert.equal(actual.signatures.length, 1, 'signatures.length');
	});

	it('Passed three parameters of two', () => {
		const actual = getSignatureHelp(['@include two(1, 2, 3,|']);

		assert.equal(actual.signatures.length, 0);
	});

	it('Passed two parameter of two with parenthesis', () => {
		const actual = getSignatureHelp(['@include two(1, 2)|']);

		assert.equal(actual.signatures.length, 0);
	});
});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Mixins', () => {
	it('RGBA', () => {
		const actual = getSignatureHelp(['@include two(rgba(0,0,0,.0001),|']);

		assert.equal(actual.activeParameter, 1, 'activeParameter');
		assert.equal(actual.signatures.length, 2, 'signatures.length');
	});

	it('RGBA when typing', () => {
		const actual = getSignatureHelp(['@include two(rgba(0,0,0,|']);

		assert.equal(actual.activeParameter, 0, 'activeParameter');
		assert.equal(actual.signatures.length, 3, 'signatures.length');
	});

	it('Quotes', () => {
		const actual = getSignatureHelp(['@include two("\\",;",|']);

		assert.equal(actual.activeParameter, 1, 'activeParameter');
		assert.equal(actual.signatures.length, 2, 'signatures.length');
	});

	it('With overload', () => {
		const actual = getSignatureHelp(['@include two(|']);

		assert.equal(actual.signatures.length, 3);
	});

	it('Single-line selector', () => {
		const actual = getSignatureHelp(['h1 { @include two(1,| }']);

		assert.equal(actual.signatures.length, 2);
	});

	it('Single-line Mixin reference', () => {
		const actual = getSignatureHelp([
			'h1 {',
			'    @include two(1, 2);',
			'    @include two(1,|)',
			'}']);

		assert.equal(actual.signatures.length, 2);
	});

	it('Mixin with named argument', () => {
		const actual = getSignatureHelp(['@include two($a: 1,|']);

		assert.equal(actual.signatures.length, 2);
	});
});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Functions', () => {
	it('Empty', () => {
		const actual = getSignatureHelp(['content: make(|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Single-line Function reference', () => {
		const actual = getSignatureHelp(['content: make()+make(|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another uncompleted function', () => {
		const actual = getSignatureHelp(['content: attr(make(|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another completed function', () => {
		const actual = getSignatureHelp(['content: attr(one(1, two(1, two(1, 2)),|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('one'), 'name');
	});

	it('Inside several completed functions', () => {
		const actual = getSignatureHelp(['background: url(one(1, one(1, 2, two(1, 2)),|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('one'), 'name');
	});

	it('Inside another function with CSS function', () => {
		const actual = getSignatureHelp(['background-color: make(rgba(|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another function with uncompleted CSS function', () => {
		const actual = getSignatureHelp(['background-color: make(rgba(1, 1,2,|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another function with completed CSS function', () => {
		const actual = getSignatureHelp(['background-color: make(rgba(1,2, 3,.5)|']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});

	it('Interpolation', () => {
		const actual = getSignatureHelp(['background-color: "#{make(|}"']);

		assert.equal(actual.signatures.length, 1, 'length');
		assert.ok(actual.signatures[0].label.startsWith('make'), 'name');
	});
});
