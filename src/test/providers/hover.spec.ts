'use strict';

import * as assert from 'assert';

import StorageService from '../../services/storage';
import { doHover } from '../../providers/hover';
import * as helpers from '../helpers';

const storage = new StorageService();
const settings = helpers.makeSettings();

interface IHover {
	language: string;
	value: string;
}

describe('Providers/Hover', () => {
	it('doHover - Variables', () => {
		const doc = helpers.makeDocument([
			'$one: 1;',
			'.a { content: $one; }'
		]);

		// $o|
		assert.equal(<any>doHover(doc, 2, storage, settings), null);
		// .a { content: $o|
		assert.equal((<IHover>doHover(doc, 25, storage, settings).contents).value, '$one: 1;');
	});

	it('doHover - Mixins', () => {
		const doc = helpers.makeDocument([
			'@mixin one($a) { content: "nope"; }',
			'@include one(1);'
		]);

		// @m|
		assert.equal(<any>doHover(doc, 2, storage, settings), null);
		// @mixin on|
		assert.equal(<any>doHover(doc, 9, storage, settings), null);
		// @mixin one($|
		assert.equal(<any>doHover(doc, 12, storage, settings), null);
		// @mixin one($a) { con|
		assert.equal(<any>doHover(doc, 20, storage, settings), null);
		// @mixin one($a) { content: "no|
		assert.equal(<any>doHover(doc, 29, storage, settings), null);
		// @inc|
		assert.equal((<IHover>doHover(doc, 40, storage, settings).contents).value, '@mixin one($a: null) {…}');
		// @include on|
		assert.equal((<IHover>doHover(doc, 47, storage, settings).contents).value, '@mixin one($a: null) {…}');
	});

	it('doHover - Functions', () => {
		const doc = helpers.makeDocument([
			'@function make($a) { @return $a; }',
			'.hi { content: make(1); }'
		]);

		// @f|
		assert.equal(<any>doHover(doc, 2, storage, settings), null);
		// @function ma|
		assert.equal(<any>doHover(doc, 12, storage, settings), null);
		// @function make($a) { @re|
		assert.equal(<any>doHover(doc, 24, storage, settings), null);
		// @function make($a) { @return $|
		assert.equal((<IHover>doHover(doc, 30, storage, settings).contents).value, '$a: null;');
		// .hi { content: ma|
		assert.equal((<IHover>doHover(doc, 52, storage, settings).contents).value, '@function make($a: null) {…}');
	});
});
