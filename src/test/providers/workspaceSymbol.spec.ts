'use strict';

import * as assert from 'assert';

import { getCacheStorage } from '../../services/cache';
import { searchWorkspaceSymbol } from '../../providers/workspaceSymbol';

const cache = getCacheStorage();

cache.set('one.less', {
	document: 'one.less',
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

	it('searchWorkspaceSymbol - Empty query', () => {
		assert.equal(searchWorkspaceSymbol('', cache, '').length, 3);
	});

	it('searchWorkspaceSymbol - Non-empty query', () => {
		assert.equal(searchWorkspaceSymbol('$', cache, '').length, 1);
	});

});
