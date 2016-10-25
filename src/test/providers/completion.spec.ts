'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doCompletion } from '../../providers/completion';

describe('Providers/Completion', () => {

	it('doCompletion', () => {
		const cache = getCacheStorage();

		cache.set('hide.scss', {
			document: 'test.scss',
			variables: [
				{
					name: '$test',
					value: null,
					offset: 0
				},
				{
					name: '$skip',
					value: '{ content: ""; }',
					offset: 0
				}
			],
			mixins: [
				{
					name: 'test',
					parameters: [],
					offset: 0
				}
			],
			functions: [
				{
					name: 'func',
					parameters: [],
					offset: 0
				}
			],
			imports: []
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true,
			suggestFunctions: true
		};

		let document = null;

		// Should show Variables suggestions
		document = TextDocument.create('test.scss', 'scss', 1, '$');
		assert.equal(doCompletion(document, 1, settings, cache).items.length, 2);

		// Should show Mixins suggestions
		document = TextDocument.create('test.scss', 'scss', 1, '@include ');
		assert.equal(doCompletion(document, 9, settings, cache).items.length, 1);

		// Should show Functions suggestions
		document = TextDocument.create('test.scss', 'scss', 1, 'content: ');
		assert.equal(doCompletion(document, 9, settings, cache).items.length, 1);

		// Should discard suggestions inside comments
		document = TextDocument.create('test.scss', 'scss', 1, '// $');
		assert.equal(doCompletion(document, 4, settings, cache).items.length, 0);

		// Should discard suggestions for parent Mixins in Mixin
		document = TextDocument.create('test.scss', 'scss', 1, '@mixin test() { . }');
		assert.equal(doCompletion(document, 17, settings, cache).items.length, 0);
	});

});
