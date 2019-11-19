'use strict';

import * as assert from 'assert';

import * as sinon from 'sinon';

import { getCacheStorage } from '../../services/cache';
import { ISettings } from '../../types/settings';
import ScannerService from '../../services/scanner';

class ScannerServiceTest extends ScannerService {
	protected _readFile = sinon.stub();
	protected _fileExists = sinon.stub();

	public get readFileStub(): sinon.SinonStub {
		return this._readFile;
	}

	public get fileExistsStub(): sinon.SinonStub {
		return this._fileExists;
	}
}

describe('Services/Scanner', () => {
	describe('.scan', () => {
		it('should find files and update cache', async () => {
			const cache = getCacheStorage();
			const settings = {} as ISettings;
			const scanner = new ScannerServiceTest(cache, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('$name: value;');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss', 'variables.scss']);

			assert.deepStrictEqual(cache.keys(), ['index.scss', 'variables.scss']);
			assert.ok('index.scss' in cache.storage());
			assert.strictEqual(cache.get('index.scss').variables.length, 1);

			assert.strictEqual(scanner.fileExistsStub.callCount, 2);
			assert.strictEqual(scanner.readFileStub.callCount, 2);
		});

		it('should find file and imported files', async () => {
			const cache = getCacheStorage();
			const settings = {
				scanImportedFiles: true
			} as ISettings;
			const scanner = new ScannerServiceTest(cache, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss']);

			assert.deepStrictEqual(cache.keys(), ['index.scss', 'variables.scss']);

			assert.strictEqual(scanner.fileExistsStub.callCount, 2);
			assert.strictEqual(scanner.readFileStub.callCount, 2);
		});

		it('should do not find imported files when it not required', async () => {
			const cache = getCacheStorage();
			const settings = {
				scanImportedFiles: false
			} as ISettings;
			const scanner = new ScannerServiceTest(cache, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss']);

			assert.deepStrictEqual(cache.keys(), ['index.scss']);

			assert.strictEqual(scanner.fileExistsStub.callCount, 1);
			assert.strictEqual(scanner.readFileStub.callCount, 1);
		});

		it('should do not find imported files when the recursive mode is no required', async () => {
			const cache = getCacheStorage();
			const settings = {
				scanImportedFiles: true
			} as ISettings;
			const scanner = new ScannerServiceTest(cache, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss'], /* recursive */ false);

			assert.deepStrictEqual(cache.keys(), ['index.scss']);

			assert.strictEqual(scanner.fileExistsStub.callCount, 1);
			assert.strictEqual(scanner.readFileStub.callCount, 1);
		});
	});
});
