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

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 8);
			assert.equal(Object.keys(cache.storage()).length, 8);
		});
	});

	it('Scan without Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions']
		};

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 2);
			assert.equal(Object.keys(cache.storage()).length, 2);
		});
	});

	it('Scan with Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions'],
			scanImportedFiles: true
		};

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 9);
			assert.equal(Object.keys(cache.storage()).length, 8);
		});
	});

	it('Scan with Include Paths', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scanImportedFiles: true,
			includePaths: ['../fixtures', './includepaths']
		};

		return doScanner('./fixtures2', cache, options).then((symbols) => {
			assert.equal(symbols.length, 5);
			assert.equal(Object.keys(cache.storage()).length, 5);
		});
	});
});
