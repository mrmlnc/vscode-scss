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
	showImplicitlyLabel: true,
	suggestMixins: true,
	suggestVariables: true,
	suggestFunctions: true
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

describe('Providers/Completion', () => {

	it('doCompletion - Variables suggestions', () => {
		const doc = makeDocument('$');
		assert.equal(doCompletion(doc, 1, settings, cache).items.length, 2);
	});

	it('doCompletion - Mixins suggestions', () => {
		const doc = makeDocument('@include ');
		assert.equal(doCompletion(doc, 9, settings, cache).items.length, 1);
	});

	it('doCompletion - Property value suggestions', () => {
		const doc = makeDocument('.a { content:  }');
		assert.equal(doCompletion(doc, 14, settings, cache).items.length, 3);
	});

	it('doCompletion - discard suggestions inside single-line comments', () => {
		const doc = makeDocument('// $');
		assert.equal(doCompletion(doc, 4, settings, cache).items.length, 0);
	});

	it('doCompletion - discard suggestions inside block comments', () => {
		const doc = makeDocument('/* $ */');
		assert.equal(doCompletion(doc, 4, settings, cache).items.length, 0);
	});

	it('doCompletion - Show implicitly label', () => {
		const doc = makeDocument('$');
		assert.equal(doCompletion(doc, 1, settings, cache).items[0].detail, '(implicitly) one.scss');
	});

	it('doCompletion - Hide implicitly label', () => {
		const doc = makeDocument('$');
		settings.showImplicitlyLabel = false;
		assert.equal(doCompletion(doc, 1, settings, cache).items[0].detail, 'one.scss');
	});

});
