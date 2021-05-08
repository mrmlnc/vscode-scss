'use strict';

import * as assert from 'assert';

import type { Hover } from 'vscode-languageserver';

import StorageService from '../../services/storage';
import { doHover } from '../../providers/hover';
import * as helpers from '../helpers';

const storage = new StorageService();

storage.set('file.scss', {
	document: 'file.scss',
	filepath: 'file.scss',
	variables: [
		{ name: '$variable', value: null, offset: 0, position: { line: 1, character: 1 } }
	],
	mixins: [
		{ name: 'mixin', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	imports: []
});

function getHover(lines: string[]): Promise<Hover | null> {
	const text = lines.join('\n');

	const document = helpers.makeDocument(text);
	const offset = text.indexOf('|');

	return doHover(document, offset, storage);
}

describe('Providers/Hover', () => {
	it('should suggest local symbols', async () => {
		const actual = await getHover([
			'$one: 1;',
			'.a { content: $one|; }'
		]);

		assert.deepStrictEqual(actual?.contents, helpers.makeMarkupContentForScssLanguage('$one: 1;'));
	});

	it('should suggest global variables', async () => {
		const actual = await getHover([
			'.a { content: $variable|; }'
		]);

		assert.deepStrictEqual(actual?.contents, helpers.makeMarkupContentForScssLanguage('$variable: null;\n@import "file.scss" (implicitly)'));
	});

	it('should suggest global mixins', async () => {
		const actual = await getHover([
			'@include mixin|'
		]);

		assert.deepStrictEqual(actual?.contents, helpers.makeMarkupContentForScssLanguage('@mixin mixin() {…}\n@import "file.scss" (implicitly)'));
	});

	// Does not work right now
	it.skip('should suggest global functions', async () => {
		const actual = await getHover([
			'.a { content: make|(); }'
		]);

		assert.deepStrictEqual(actual?.contents, helpers.makeMarkupContentForScssLanguage('@function make($a: null) {…}\n@import "file.scss" (implicitly)'));
	});
});
