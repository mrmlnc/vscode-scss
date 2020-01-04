'use strict';

import * as assert from 'assert';

import { CompletionItemKind, CompletionList } from 'vscode-languageserver';

import StorageService from '../../services/storage';
import { doCompletion } from '../../providers/completion';
import * as helpers from '../helpers';
import { ISettings } from '../../types/settings';

const storage = new StorageService();

storage.set('one.scss', {
	document: 'one.scss',
	filepath: 'one.scss',
	variables: [
		{ name: '$one', value: '1', offset: 0, position: null },
		{ name: '$two', value: null, offset: 0, position: null },
		{ name: '$hex', value: '#fff', offset: 0, position: null },
		{ name: '$rgb', value: 'rgb(0,0,0)', offset: 0, position: null },
		{ name: '$word', value: 'red', offset: 0, position: null }
	],
	mixins: [
		{ name: 'test', parameters: [], offset: 0, position: null }
	],
	functions: [
		{ name: 'make', parameters: [], offset: 0, position: null }
	],
	imports: []
});

function getCompletionList(lines: string[], options?: Partial<ISettings>): Promise<CompletionList> {
	const text = lines.join('\n');

	const settings = helpers.makeSettings(options);
	const document = helpers.makeDocument(text);
	const offset = text.indexOf('|');

	return doCompletion(document, offset, settings, storage);
}

describe('Providers/Completion - Basic', () => {
	it('Variables', async () => {
		const actual = await getCompletionList(['$|']);

		assert.equal(actual.items.length, 5);
	});

	it('Mixins', async () => {
		const actual = await getCompletionList(['@include |']);

		assert.equal(actual.items.length, 1);
	});
});

describe('Providers/Completion - Context', async () => {
	it('Empty property value', async () => {
		const actual = await getCompletionList(['.a { content: | }']);

		assert.equal(actual.items.length, 5);
	});

	it('Non-empty property value without suggestions', async () => {
		const actual = await getCompletionList(['.a { background: url(../images/one|.png); }']);

		assert.equal(actual.items.length, 0);
	});

	it('Non-empty property value with Variables', async () => {
		const actual = await getCompletionList(['.a { background: url(../images/#{$one|}/one.png); }']);

		assert.equal(actual.items.length, 5);
	});

	it('Discard suggestions inside quotes', async () => {
		const actual = await getCompletionList([
			'.a {',
			'    background: url("../images/#{$one}/$one|.png");',
			'}'
		]);

		assert.equal(actual.items.length, 0);
	});

	it('Custom value for `suggestFunctionsInStringContextAfterSymbols` option', async () => {
		const actual = await getCompletionList(['.a { background: url(../images/m|'], {
			suggestFunctionsInStringContextAfterSymbols: '/'
		});

		assert.equal(actual.items.length, 1);
	});

	it('Discard suggestions inside single-line comments', async () => {
		const actual = await getCompletionList(['// $|']);

		assert.equal(actual.items.length, 0);
	});

	it('Discard suggestions inside block comments', async () => {
		const actual = await getCompletionList(['/* $| */']);

		assert.equal(actual.items.length, 0);
	});

	it('Identify color variables', async () => {
		const actual = await getCompletionList(['$|']);

		assert.equal(actual.items[0].kind, CompletionItemKind.Variable);
		assert.equal(actual.items[1].kind, CompletionItemKind.Variable);
		assert.equal(actual.items[2].kind, CompletionItemKind.Color);
		assert.equal(actual.items[3].kind, CompletionItemKind.Color);
		assert.equal(actual.items[4].kind, CompletionItemKind.Color);
	});
});

describe('Providers/Completion - Implicitly', () => {
	it('Show default implicitly label', async () => {
		const actual = await getCompletionList(['$|']);

		assert.equal(actual.items[0].detail, '(implicitly) one.scss');
	});

	it('Show custom implicitly label', async () => {
		const actual = await getCompletionList(['$|'], {
			implicitlyLabel: '👻'
		});

		assert.equal(actual.items[0].detail, '👻 one.scss');
	});

	it('Hide implicitly label', async () => {
		const actual = await getCompletionList(['$|'], {
			implicitlyLabel: null
		});

		assert.equal(actual.items[0].detail, 'one.scss');
	});
});
