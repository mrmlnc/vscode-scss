'use strict';

import * as assert from 'assert';

import StorageService from '../../services/storage';
import { getSymbolsCollection } from '../../utils/symbols';

describe('Utils/Symbols', () => {
	it('getSymbolsCollection', () => {
		const storage = new StorageService();

		storage.set('test.scss', {
			document: 'test.scss',
			variables: [],
			mixins: [],
			functions: [],
			imports: []
		});

		assert.strictEqual(getSymbolsCollection(storage).length, 1);
	});
});
