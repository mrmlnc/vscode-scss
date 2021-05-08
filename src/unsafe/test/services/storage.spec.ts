import * as assert from 'assert';

import StorageService from '../../services/storage';
import type { IDocumentSymbols } from '../../types/symbols';

describe('Services → Storage', () => {
	describe('.set & .get', () => {
		it('should add item to the storage', () => {
			const service = new StorageService();

			service.set('key', {
				functions: [],
				imports: [],
				mixins: [],
				variables: []
			});

			const actual = service.get('key');

			assert.deepStrictEqual(actual?.functions, []);
		});
	});

	describe('.delete', () => {
		it('should delete item from the storage', () => {
			const service = new StorageService();

			service.set('key', {
				functions: [],
				imports: [],
				mixins: [],
				variables: []
			});

			service.delete('key');

			const actual = service.get('key');

			assert.strictEqual(actual, undefined);
		});
	});

	describe('.keys', () => {
		it('should return storage keys', () => {
			const service = new StorageService();

			service.set('key', {
				functions: [],
				imports: [],
				mixins: [],
				variables: []
			});

			const actual = service.keys();

			assert.deepStrictEqual(actual, ['key']);
		});
	});

	describe('.values', () => {
		it('should return storage values', () => {
			const service = new StorageService();

			const symbols: IDocumentSymbols = {
				functions: [],
				imports: [],
				mixins: [],
				variables: []
			};

			service.set('key', symbols);

			const actual = service.values();

			assert.deepStrictEqual(actual, [symbols]);
		});
	});

	describe('.entries', () => {
		it('should return storage entries', () => {
			const service = new StorageService();

			const symbols: IDocumentSymbols = {
				functions: [],
				imports: [],
				mixins: [],
				variables: []
			};

			service.set('key', symbols);

			const actual = service.entries();

			assert.deepStrictEqual(actual, [['key', symbols]]);
		});
	});
});
