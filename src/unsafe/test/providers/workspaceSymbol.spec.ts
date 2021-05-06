'use strict';

import * as assert from 'assert';

import StorageService from '../../services/storage';
import { searchWorkspaceSymbol } from '../../providers/workspaceSymbol';

const storage = new StorageService();

storage.set('one.scss', {
	document: 'one.scss',
	filepath: 'one.scss',
	variables: [
		{ name: '$a', value: '1', offset: 0, position: { line: 1, character: 1 } }
	],
	mixins: [
		{ name: 'mixin', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	imports: []
});

describe('Providers/WorkspaceSymbol', () => {
	it('searchWorkspaceSymbol - Empty query', async () => {
		const actual = await searchWorkspaceSymbol('', storage, '');

		assert.strictEqual(actual.length, 3);
	});

	it('searchWorkspaceSymbol - Non-empty query', async () => {
		const actual = await searchWorkspaceSymbol('$', storage, '');

		assert.strictEqual(actual.length, 1);
	});
});
