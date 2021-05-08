import * as path from 'path';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import type { ISettings } from '../types/settings';
import { readFile, fileExists } from '../utils/fs';
import { parseDocument } from './parser';
import type StorageService from './storage';

export default class ScannerService {
	constructor(private readonly _storage: StorageService, private readonly _settings: ISettings) {}

	public async scan(files: string[], recursive = true): Promise<void> {
		const iterator = new Set(files);

		for (let filepath of iterator) {
			// Cast to the system file path style
			filepath = path.normalize(filepath);

			const uri = URI.file(filepath).toString();

			const isExistFile = await this._fileExists(filepath);

			if (!isExistFile) {
				this._storage.delete(uri);

				continue;
			}

			const content = await this._readFile(filepath);
			const document = TextDocument.create(uri, 'scss', 1, content);
			const { symbols } = await parseDocument(document, null);

			this._storage.set(uri, { ...symbols, filepath });

			if (!recursive || !this._settings.scanImportedFiles) {
				continue;
			}

			for (const symbol of symbols.imports) {
				if (symbol.dynamic || symbol.css) {
					continue;
				}

				iterator.add(symbol.filepath);
			}
		}
	}

	protected _readFile(filepath: string): Promise<string> {
		return readFile(filepath);
	}

	protected _fileExists(filepath: string): Promise<boolean> {
		return fileExists(filepath);
	}
}
