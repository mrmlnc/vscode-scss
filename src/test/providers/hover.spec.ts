'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { getCacheStorage } from '../../services/cache';
import { doHover } from '../../providers/hover';
import { ISettings } from '../../types/settings';

const cache = getCacheStorage();

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	suggestMixins: true,
	suggestVariables: true,
	suggestFunctions: true
};

interface IHover {
	language: string;
	value: string;
}

function makeDocument(lines: string | string[]) {
	return TextDocument.create('test.scss', 'scss', 1, Array.isArray(lines) ? lines.join('\n') : lines);
}

describe('Providers/Hover', () => {

	it('doHover - Variables', () => {
		const doc = makeDocument([
			'$one: 1;',
			'.a { content: $one; }'
		]);

		// $o|
		assert.equal(<any>doHover('./fixtures', doc, 2, cache, settings), null);
		// .a { content: $o|
		assert.equal((<IHover>doHover('./fixtures', doc, 25, cache, settings).contents).value, '$one: 1;');
	});

	it('doHover - Mixins', () => {
		const doc = makeDocument([
			'@mixin one($a) { content: "nope"; }',
			'@include one(1);'
		]);

		// @m|
		assert.equal(<any>doHover('./fixtures', doc, 2, cache, settings), null);
		// @mixin on|
		assert.equal(<any>doHover('./fixtures', doc, 9, cache, settings), null);
		// @mixin one($|
		assert.equal(<any>doHover('./fixtures', doc, 12, cache, settings), null);
		// @mixin one($a) { con|
		assert.equal(<any>doHover('./fixtures', doc, 20, cache, settings), null);
		// @mixin one($a) { content: "no|
		assert.equal(<any>doHover('./fixtures', doc, 29, cache, settings), null);
		// @inc|
		assert.equal((<IHover>doHover('./fixtures', doc, 40, cache, settings).contents).value, '@mixin one($a: null) {…}');
		// @include on|
		assert.equal((<IHover>doHover('./fixtures', doc, 47, cache, settings).contents).value, '@mixin one($a: null) {…}');
	});

	it('doHover - Functions', () => {
		const doc = makeDocument([
			'@function make($a) { @return $a; }',
			'.hi { content: make(1); }'
		]);

		// @f|
		assert.equal(<any>doHover('./fixtures', doc, 2, cache, settings), null);
		// @function ma|
		assert.equal(<any>doHover('./fixtures', doc, 12, cache, settings), null);
		// @function make($a) { @re|
		assert.equal(<any>doHover('./fixtures', doc, 24, cache, settings), null);
		// @function make($a) { @return $|
		assert.equal((<IHover>doHover('./fixtures', doc, 30, cache, settings).contents).value, '$a: null;');
		// .hi { content: ma|
		assert.equal((<IHover>doHover('./fixtures', doc, 52, cache, settings).contents).value, '@function make($a: null) {…}');
	});

});
