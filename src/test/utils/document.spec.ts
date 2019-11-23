'use strict';

import * as assert from 'assert';

import { ISymbols } from '../../types/symbols';
import { getCurrentDocumentImportPaths, getDocumentPath } from '../../utils/document';

describe('Utils/Document', () => {
	it('getCurrentDocumentImports', () => {
		const symbolsList: ISymbols[] = [
			{
				document: 'a.scss',
				mixins: [],
				functions: [],
				variables: [],
				imports: [
					{
						filepath: 'b.scss',
						css: false,
						dynamic: false
					}
				]
			},
			{
				document: 'b.scss',
				mixins: [],
				functions: [],
				variables: [],
				imports: [
					{
						filepath: 'a.scss',
						css: false,
						dynamic: false
					},
					{
						filepath: 'c.scss',
						css: false,
						dynamic: false
					}
				]
			}
		];

		const imports = getCurrentDocumentImportPaths(symbolsList, 'b.scss');

		assert.equal(imports.length, 2);
	});

	it('getDocumentPath', () => {
		assert.equal(getDocumentPath('test/file.scss', 'test/includes/a.scss'), 'includes/a.scss');
		assert.equal(getDocumentPath('test/includes/a.scss', 'test/file.scss'), '../file.scss');
	});
});
