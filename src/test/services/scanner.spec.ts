'use strict';

import * as assert from 'assert';

import { getCacheStorage } from '../../services/cache';
import { doScanner } from '../../services/scanner';
import { ISettings } from '../../types/settings';

const cache = getCacheStorage();

describe('Services/Scanner', () => {
	beforeEach(() => {
		cache.dispose();
	});

	it('Scan', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: []
		};

		return doScanner('./fixtures/unit', cache, options).then(symbols => {
			assert.equal(symbols.length, 7);
			assert.equal(Object.keys(cache.storage()).length, 7);
		});
	});

	it('Scan without Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions']
		};

		return doScanner('./fixtures/unit', cache, options).then(symbols => {
			assert.equal(symbols.length, 1);
			assert.equal(Object.keys(cache.storage()).length, 1);
		});
	});

	it('Scan with Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions'],
			scanImportedFiles: true
		};

		return doScanner('./fixtures/unit', cache, options).then(symbols => {
			assert.equal(symbols.length, 8);
			assert.equal(Object.keys(cache.storage()).length, 7);
		});
	});
});
