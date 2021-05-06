'use strict';

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

import * as sinon from 'sinon';
import { Stats } from '@nodelib/fs.macchiato';

import StorageService from '../../services/storage';
import ScannerService from '../../services/scanner';
import * as helpers from '../helpers';
import { URI } from 'vscode-uri';

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
		let statStub: sinon.SinonStub;

		beforeEach(() => {
			statStub = sinon.stub(fs, 'stat').yields(null, new Stats());
		});

		afterEach(() => {
			statStub.restore();
		});

		it('should find files and update cache', async () => {
			const indexDocumentPath = path.resolve('index.scss').toLowerCase();
			const indexDocumentUri = URI.file(indexDocumentPath).toString();
			const variablesDocumentPath = path.resolve('variables.scss').toLowerCase();
			const variablesDocumentUri = URI.file(variablesDocumentPath).toString();

			const storage = new StorageService();
			const settings = helpers.makeSettings();
			const scanner = new ScannerServiceTest(storage, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('$name: value;');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan([indexDocumentPath, variablesDocumentPath]);

			assert.deepStrictEqual(storage.keys(), [indexDocumentUri, variablesDocumentUri]);
			assert.strictEqual(storage.get(indexDocumentUri)?.variables.length, 1);

			assert.strictEqual(scanner.fileExistsStub.callCount, 2);
			assert.strictEqual(scanner.readFileStub.callCount, 2);
		});

		it('should find file and imported files', async () => {
			const indexDocumentPath = path.resolve('index.scss').toLowerCase();
			const indexDocumentUri = URI.file(indexDocumentPath).toString();
			const variablesDocumentPath = path.resolve('variables.scss').toLowerCase();
			const variablesDocumentUri = URI.file(variablesDocumentPath).toString();

			const storage = new StorageService();
			const settings = helpers.makeSettings();
			const scanner = new ScannerServiceTest(storage, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan([indexDocumentPath]);

			assert.deepStrictEqual(storage.keys(), [indexDocumentUri, variablesDocumentUri]);

			assert.strictEqual(scanner.fileExistsStub.callCount, 2);
			assert.strictEqual(scanner.readFileStub.callCount, 2);
		});

		it('should do not find imported files when it not required', async () => {
			const storage = new StorageService();
			const settings = helpers.makeSettings({ scanImportedFiles: false });
			const scanner = new ScannerServiceTest(storage, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss']);

			assert.deepStrictEqual(storage.keys(), [URI.file('index.scss').toString()]);

			assert.strictEqual(scanner.fileExistsStub.callCount, 1);
			assert.strictEqual(scanner.readFileStub.callCount, 1);
		});

		it('should do not find imported files when the recursive mode is no required', async () => {
			const storage = new StorageService();
			const settings = helpers.makeSettings();
			const scanner = new ScannerServiceTest(storage, settings);

			scanner.fileExistsStub.resolves(true);
			scanner.readFileStub.onFirstCall().resolves('@import "variables.scss";');
			scanner.readFileStub.onSecondCall().resolves('');

			await scanner.scan(['index.scss'], /* recursive */ false);

			assert.deepStrictEqual(storage.keys(), [URI.file('index.scss').toString()]);

			assert.strictEqual(scanner.fileExistsStub.callCount, 1);
			assert.strictEqual(scanner.readFileStub.callCount, 1);
		});
	});
});
