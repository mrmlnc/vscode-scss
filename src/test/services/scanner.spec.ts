'use strict';

import * as assert from 'assert';

import { getCacheStorage } from '../../services/cache';
import { doScanner } from '../../services/scanner';
import { ISettings } from '../../types/settings';

const cache = getCacheStorage();

describe('Services/Scanner', () => {

	it('Scan', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: []
		};

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 7);
		});
	});

	it('Scan without Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions']
		};

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 1);
		});
	});

	it('Scan with Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/variables', '**/mixins', '**/functions'],
			scanImportedFiles: true
		};

		return doScanner('./fixtures', cache, options).then((symbols) => {
			assert.equal(symbols.length, 8);
		});
	});

});
