'use strict';

import * as assert from 'assert';

import { ISymbols } from '../../types/symbols';
import { getCacheStorage, invalidateCacheStorage } from '../../services/cache';

function makeSymbols(name: string): ISymbols {
	return {
		document: name,
		variables: [],
		mixins: [],
		functions: [],
		imports: []
	};
}

describe('Services/Cache', () => {

	it('Create cache', () => {
		const cache = getCacheStorage();

		assert.equal(typeof cache.dispose, 'function');
	});

	it('Has cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', null);

		assert.ok(cache.has('test.less'));
		assert.ok(!cache.has('nope.less'));
	});

	it('Set/Get cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', makeSymbols('test.less'));

		assert.equal(cache.get('test.less').variables.length, 0);
	});

	it('Drop cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', null);
		cache.drop('test.less');

		assert.ok(!cache.has('test.less'));
	});

	it('Dispose cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', null);
		cache.dispose();

		assert.ok(!cache.has('test.less'));
	});

	it('Cache invalidation', () => {
		const cache = getCacheStorage();

		cache.set('a.less', null);
		cache.set('b.less', null);
		cache.set('c.less', null);
		cache.set('d.less', null);

		const symbolsList: ISymbols[] = [
			makeSymbols('a.less'),
			makeSymbols('c.less')
		];

		invalidateCacheStorage(cache, symbolsList);

		assert.ok(cache.has('a.less'), 'a.less');
		assert.ok(cache.has('c.less'), 'c.less');

		assert.ok(!cache.has('b.less'), 'b.less');
		assert.ok(!cache.has('d.less'), 'd.less');
	});

});
