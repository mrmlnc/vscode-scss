'use strict';

import * as assert from 'assert';

import { TextDocument, Files } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';
import StorageService from '../../services/storage';
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

const storage = new StorageService();

storage.set('one.scss', {
	document: 'one.scss',
	filepath: 'one.scss',
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

		return goDefinition(doc, 15, storage, settings).then(result => {
			assert.ok(Files.uriToFilePath(result.uri), 'one.scss');
			assert.deepEqual(result.range, {
				start: { line: 1, character: 1 },
				end: { line: 1, character: 3 }
			});
		});
	});

	it('doGoDefinition - Variable definition', () => {
		const doc = makeDocument('$a: 1;');

		return goDefinition(doc, 2, storage, settings).then(result => {
			assert.equal(result, null);
		});
	});

	it('doGoDefinition - Mixins', () => {
		const doc = makeDocument('.a { @include mixin(); }');

		return goDefinition(doc, 16, storage, settings).then(result => {
			assert.ok(Files.uriToFilePath(result.uri), 'one.scss');
			assert.deepEqual(result.range, {
				start: { line: 1, character: 1 },
				end: { line: 1, character: 6 }
			});
		});
	});

	it('doGoDefinition - Mixin definition', () => {
		const doc = makeDocument('@mixin mixin($a) {}');

		return goDefinition(doc, 8, storage, settings).then(result => {
			assert.equal(result, null);
		});
	});

	it('doGoDefinition - Mixin Arguments', () => {
		const doc = makeDocument('@mixin mixin($a) {}');

		return goDefinition(doc, 10, storage, settings).then(result => {
			assert.equal(result, null);
		});
	});

	it('doGoDefinition - Functions', () => {
		const doc = makeDocument('.a { content: make(1); }');

		return goDefinition(doc, 16, storage, settings).then(result => {
			assert.ok(Files.uriToFilePath(result.uri), 'one.scss');
			assert.deepEqual(result.range, {
				start: { line: 1, character: 1 },
				end: { line: 1, character: 5 }
			});
		});
	});

	it('doGoDefinition - Function definition', () => {
		const doc = makeDocument('@function make($a) {}');

		return goDefinition(doc, 8, storage, settings).then(result => {
			assert.equal(result, null);
		});
	});

	it('doGoDefinition - Function Arguments', () => {
		const doc = makeDocument('@function make($a) {}');

		return goDefinition(doc, 13, storage, settings).then(result => {
			assert.equal(result, null);
		});
	});
});
