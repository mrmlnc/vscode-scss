'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doCompletion } from '../../providers/completion';

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	implicitlyLabel: '(implicitly)',
	suggestMixins: true,
	suggestVariables: true,
	suggestFunctions: true,
	suggestFunctionsInStringContextAfterSymbols: ' (+-*%'
};

function makeDocument(lines: string | string[]) {
	return TextDocument.create('test.scss', 'scss', 1, Array.isArray(lines) ? lines.join('\n') : lines);
}

const cache = getCacheStorage();

cache.set('one.scss', {
	document: 'one.scss',
	variables: [
		{ name: '$one', value: '1', offset: 0, position: null },
		{ name: '$two', value: null, offset: 0, position: null }
	],
	mixins: [
		{ name: 'test', parameters: [], offset: 0, position: null }
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: null }
	],
	imports: []
});

describe('Providers/Completion - Basic', () => {

	it('Variables', () => {
		const doc = makeDocument('$');
		assert.equal(doCompletion('./fixtures', doc, 1, settings, cache).items.length, 2);
	});

	it('Mixins', () => {
		const doc = makeDocument('@include ');
		assert.equal(doCompletion('./fixtures', doc, 9, settings, cache).items.length, 1);
	});

});

describe('Providers/Completion - Context', () => {

	it('Empty property value', () => {
		const doc = makeDocument('.a { content:  }');
		assert.equal(doCompletion('./fixtures', doc, 14, settings, cache).items.length, 2);
	});

	it('Non-empty property value without suggestions', () => {
		const doc = makeDocument('.a { background: url(../images/one.png); }');
		assert.equal(doCompletion('./fixtures', doc, 34, settings, cache).items.length, 0);
	});

	it('Non-empty property value with Variables', () => {
		const doc = makeDocument('.a { background: url(../images/#{$one}/one.png); }');
		assert.equal(doCompletion('./fixtures', doc, 37, settings, cache).items.length, 2, 'True');
		assert.equal(doCompletion('./fixtures', doc, 42, settings, cache).items.length, 0, 'False');
	});

	it('Discard suggestions inside quotes', () => {
		const doc = makeDocument('.a { background: url("../images/#{$one}/$one.png"); @include test("test", $one); }');
		assert.equal(doCompletion('./fixtures', doc, 44, settings, cache).items.length, 0, 'Hide');
		assert.equal(doCompletion('./fixtures', doc, 38, settings, cache).items.length, 3, 'True');
		assert.equal(doCompletion('./fixtures', doc, 78, settings, cache).items.length, 2, 'Mixin');
	});

	it('Custom value for `suggestFunctionsInStringContextAfterSymbols` option', () => {
		const doc = makeDocument('.a { background: url(../images/m');
		const options = Object.assign(settings, <ISettings>{
			suggestFunctionsInStringContextAfterSymbols: '/'
		});
		assert.equal(doCompletion('./fixtures', doc, 32, options, cache).items.length, 1);
	});

	it('Discard suggestions inside single-line comments', () => {
		const doc = makeDocument('// $');
		assert.equal(doCompletion('./fixtures', doc, 4, settings, cache).items.length, 0);
	});

	it('Discard suggestions inside block comments', () => {
		const doc = makeDocument('/* $ */');
		assert.equal(doCompletion('./fixtures', doc, 4, settings, cache).items.length, 0);
	});

});

describe('Providers/Completion - Implicitly', () => {

	it('Show default implicitly label', () => {
		const doc = makeDocument('$');
		assert.equal(doCompletion('./fixtures', doc, 1, settings, cache).items[0].detail, '(implicitly) one.scss');
	});

	it('Show custom implicitly label', () => {
		const doc = makeDocument('$');
		settings.implicitlyLabel = '👻';
		assert.equal(doCompletion('./fixtures', doc, 1, settings, cache).items[0].detail, '👻 one.scss');
	});

	it('Hide implicitly label', () => {
		const doc = makeDocument('$');
		settings.implicitlyLabel = null;
		assert.equal(doCompletion('./fixtures', doc, 1, settings, cache).items[0].detail, 'one.scss');
	});

});
