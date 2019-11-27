'use strict';

import * as assert from 'assert';

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

describe('Providers/SignatureHelp - Empty', () => {
	it('Empty', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include one(');

		assert.equal(doSignatureHelp(document, 13, storage, settings).signatures.length, 1);
	});
	it('Closed without parameters', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two()');

		assert.equal(doSignatureHelp(document, 13, storage, settings).signatures.length, 3);
	});

	it('Closed with parameters', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(1);');

		assert.equal(doSignatureHelp(document, 16, storage, settings).signatures.length, 0);
	});
});

describe('Providers/SignatureHelp - Two parameters', () => {
	it('Passed one parameter of two', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(1,');

		const signature = doSignatureHelp(document, 15, storage, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('Passed two parameter of two', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(1, 2,');

		const signature = doSignatureHelp(document, 18, storage, settings);

		assert.equal(signature.activeParameter, 2, 'activeParameter');
		assert.equal(signature.signatures.length, 1, 'signatures.length');
	});

	it('Passed three parameters of two', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(1, 2, 3,');

		const signature = doSignatureHelp(document, 21, storage, settings);

		assert.equal(signature.signatures.length, 0);
	});

	it('Passed two parameter of two with parenthesis', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(1, 2)');

		const signature = doSignatureHelp(document, 18, storage, settings);

		assert.equal(signature.signatures.length, 0);
	});
});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Mixins', () => {
	it('RGBA', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(rgba(0,0,0,.0001),');

		const signature = doSignatureHelp(document, 31, storage, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('RGBA when typing', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(rgba(0,0,0,');

		const signature = doSignatureHelp(document, 24, storage, settings);

		assert.equal(signature.activeParameter, 0, 'activeParameter');
		assert.equal(signature.signatures.length, 3, 'signatures.length');
	});

	it('Quotes', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two("\\",;",');

		const signature = doSignatureHelp(document, 20, storage, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('With overload', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two(');

		const signature = doSignatureHelp(document, 13, storage, settings);

		assert.equal(signature.signatures.length, 3);
	});

	it('Single-line selector', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('h1 { @include two(1, }');

		const signature = doSignatureHelp(document, 20, storage, settings);

		assert.equal(signature.signatures.length, 2);
	});

	it('Single-line Mixin reference', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('h1 { @include two(1, 2); @include two(1,) }');

		const signature = doSignatureHelp(document, 40, storage, settings);

		assert.equal(signature.signatures.length, 2);
	});

	it('Mixin with named argument', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('@include two($a: 1,');

		const signature = doSignatureHelp(document, 19, storage, settings);

		assert.equal(signature.signatures.length, 2);
	});
});

describe('Providers/SignatureHelp - parseArgumentsAtLine for Functions', () => {
	it('Empty', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('content: make(');

		const signatures = doSignatureHelp(document, 14, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Single-line Function reference', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('content: make()+make(');

		const signatures = doSignatureHelp(document, 21, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another uncompleted function', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('content: attr(make(');

		const signatures = doSignatureHelp(document, 19, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another completed function', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('content: attr(one(1, two(1, two(1, 2)),');

		const signatures = doSignatureHelp(document, 39, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('one'), 'name');
	});

	it('Inside several completed functions', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('background: url(one(1, one(1, 2, two(1, 2)),');

		const signatures = doSignatureHelp(document, 44, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('one'), 'name');
	});

	it('Inside another function with CSS function', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('background-color: make(rgba(');

		const signatures = doSignatureHelp(document, 28, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another function with uncompleted CSS function', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('background-color: make(rgba(1, 1,2,');

		const signatures = doSignatureHelp(document, 35, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Inside another function with completed CSS function', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('background-color: make(rgba(1,2, 3,.5)');

		const signatures = doSignatureHelp(document, 38, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});

	it('Interpolation', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument('background-color: "#{make(}"');

		const signatures = doSignatureHelp(document, 26, storage, settings).signatures;

		assert.equal(signatures.length, 1, 'length');
		assert.ok(signatures[0].label.startsWith('make'), 'name');
	});
});
