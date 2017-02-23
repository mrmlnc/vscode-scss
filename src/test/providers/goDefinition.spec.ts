'use strict';

import * as assert from 'assert';

import { TextDocument, Files } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { goDefinition } from '../../providers/goDefinition';

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
	variables: [
		{ name: '$a', value: '1', offset: 0, position: { line: 1, character: 1 } }
	],
	mixins: [
		{ name: 'mixin', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	imports: []
});

describe('Providers/GoDefinition', () => {

	it('doGoDefinition - Variables', () => {
		const doc = makeDocument('.a { content: $a; }');
		const result = goDefinition('./fixtures', doc, 15, cache, settings);

		assert.equal(result.length, 1);
		assert.ok(Files.uriToFilePath(result[0].uri), 'one.scss');
		assert.deepEqual(result[0].range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 3 }
		});
	});

	it('doGoDefinition - Variable definition', () => {
		const doc = makeDocument('$a: 1;');
		const result = goDefinition('./fixtures', doc, 2, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Mixins', () => {
		const doc = makeDocument('.a { @include mixin(); }');
		const result = goDefinition('./fixtures', doc, 16, cache, settings);

		assert.equal(result.length, 1);
		assert.ok(Files.uriToFilePath(result[0].uri), 'one.scss');
		assert.deepEqual(result[0].range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 6 }
		});
	});

	it('doGoDefinition - Mixin definition', () => {
		const doc = makeDocument('@mixin mixin($a) {}');
		const result = goDefinition('./fixtures', doc, 8, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Mixin Arguments', () => {
		const doc = makeDocument('@mixin mixin($a) {}');
		const result = goDefinition('./fixtures', doc, 10, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Functions', () => {
		const doc = makeDocument('.a { content: make(1); }');
		const result = goDefinition('./fixtures', doc, 16, cache, settings);

		assert.equal(result.length, 1);
		assert.ok(Files.uriToFilePath(result[0].uri), 'one.scss');
		assert.deepEqual(result[0].range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 5 }
		});
	});

	it('doGoDefinition - Function definition', () => {
		const doc = makeDocument('@function make($a) {}');
		const result = goDefinition('./fixtures', doc, 8, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Function Arguments', () => {
		const doc = makeDocument('@function make($a) {}');
		const result = goDefinition('./fixtures', doc, 13, cache, settings);

		assert.equal(result.length, 0);
	});

});
