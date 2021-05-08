'use strict';

import * as assert from 'assert';

import { URI } from 'vscode-uri';

import StorageService from '../../services/storage';
import { goDefinition } from '../../providers/goDefinition';
import * as helpers from '../helpers';

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
	it('doGoDefinition - Variables', async () => {
		const document = helpers.makeDocument('.a { content: $a; }');

		const actual = await goDefinition(document, 15, storage);



		assert.ok(URI.parse(actual?.uri ?? ''), 'one.scss');
		assert.deepStrictEqual(actual?.range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 3 }
		});
	});

	it('doGoDefinition - Variable definition', async () => {
		const document = helpers.makeDocument('$a: 1;');

		const actual = await goDefinition(document, 2, storage);

		assert.strictEqual(actual, null);
	});

	it('doGoDefinition - Mixins', async () => {
		const document = helpers.makeDocument('.a { @include mixin(); }');

		const actual = await goDefinition(document, 16, storage);

		assert.ok(URI.parse(actual?.uri ?? ''), 'one.scss');
		assert.deepStrictEqual(actual?.range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 6 }
		});
	});

	it('doGoDefinition - Mixin definition', async () => {
		const document = helpers.makeDocument('@mixin mixin($a) {}');

		const actual = await goDefinition(document, 8, storage);

		assert.strictEqual(actual, null);
	});

	it('doGoDefinition - Mixin Arguments', async () => {
		const document = helpers.makeDocument('@mixin mixin($a) {}');

		const actual = await goDefinition(document, 10, storage);

		assert.strictEqual(actual, null);
	});

	it('doGoDefinition - Functions', async () => {
		const document = helpers.makeDocument('.a { content: make(1); }');

		const actual = await goDefinition(document, 16, storage);

		assert.ok(URI.parse(actual?.uri ?? ''), 'one.scss');
		assert.deepStrictEqual(actual?.range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 5 }
		});
	});

	it('doGoDefinition - Function definition', async () => {
		const document = helpers.makeDocument('@function make($a) {}');

		const actual = await goDefinition(document, 8, storage);

		assert.strictEqual(actual, null);
	});

	it('doGoDefinition - Function Arguments', async () => {
		const document = helpers.makeDocument('@function make($a) {}');

		const actual = await goDefinition(document, 13, storage);

		assert.strictEqual(actual, null);
	});
});
