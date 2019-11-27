'use strict';

import * as assert from 'assert';

import StorageService from '../../services/storage';
import { doHover } from '../../providers/hover';
import * as helpers from '../helpers';

const storage = new StorageService();

interface IHover {
	language: string;
	value: string;
}

describe('Providers/Hover', () => {
	it('doHover - Variables', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument([
			'$one: 1;',
			'.a { content: $one; }'
		]);

		// $o|
		assert.equal(<any>doHover(document, 2, storage, settings), null);
		// .a { content: $o|
		assert.equal((<IHover>doHover(document, 25, storage, settings).contents).value, '$one: 1;');
	});

	it('doHover - Mixins', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument([
			'@mixin one($a) { content: "nope"; }',
			'@include one(1);'
		]);

		// @m|
		assert.equal(<any>doHover(document, 2, storage, settings), null);
		// @mixin on|
		assert.equal(<any>doHover(document, 9, storage, settings), null);
		// @mixin one($|
		assert.equal(<any>doHover(document, 12, storage, settings), null);
		// @mixin one($a) { con|
		assert.equal(<any>doHover(document, 20, storage, settings), null);
		// @mixin one($a) { content: "no|
		assert.equal(<any>doHover(document, 29, storage, settings), null);
		// @inc|
		assert.equal((<IHover>doHover(document, 40, storage, settings).contents).value, '@mixin one($a: null) {…}');
		// @include on|
		assert.equal((<IHover>doHover(document, 47, storage, settings).contents).value, '@mixin one($a: null) {…}');
	});

	it('doHover - Functions', () => {
		const settings = helpers.makeSettings();
		const document = helpers.makeDocument([
			'@function make($a) { @return $a; }',
			'.hi { content: make(1); }'
		]);

		// @f|
		assert.equal(<any>doHover(document, 2, storage, settings), null);
		// @function ma|
		assert.equal(<any>doHover(document, 12, storage, settings), null);
		// @function make($a) { @re|
		assert.equal(<any>doHover(document, 24, storage, settings), null);
		// @function make($a) { @return $|
		assert.equal((<IHover>doHover(document, 30, storage, settings).contents).value, '$a: null;');
		// .hi { content: ma|
		assert.equal((<IHover>doHover(document, 52, storage, settings).contents).value, '@function make($a: null) {…}');
	});
});
