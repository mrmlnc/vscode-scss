'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { getCacheStorage } from '../../services/cache';
import { doHover } from '../../providers/hover';
import { ISettings } from '../../types/settings';

const ls = getSCSSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

interface IHover {
	language: string;
	value: string;
}

describe('Providers/Hover', () => {

	it('doHover', () => {
		const cache = getCacheStorage();

		cache.set('test.scss', {
			document: 'test.scss',
			variables: [
				{
					name: '$test',
					value: '1',
					offset: 0
				}
			],
			mixins: [
				{
					name: 'test',
					parameters: [],
					offset: 0
				}
			],
			functions: [
				{
					name: 'func',
					parameters: [],
					offset: 0
				}
			],
			imports: []
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true,
			suggestFunctions: true
		};

		const document = TextDocument.create('test.scss', 'scss', 1, [
			'$test: 1;',
			'@mixin test() {}',
			'.a { content: func(); }',
			'@function func() {}'
		].join('\n'));

		// Variable
		const variableHover: IHover = <any>doHover(document, 2, cache, settings).contents;

		assert.equal(variableHover.language, 'scss');
		assert.equal(variableHover.value, '$test: 1;');

		// Mixin
		const mixinHover: IHover = <any>doHover(document, 18, cache, settings).contents;

		assert.equal(mixinHover.language, 'scss');
		assert.equal(mixinHover.value, '@mixin test() {…}');

		// Function
		const functionReferenceHover: IHover = <any>doHover(document, 45, cache, settings).contents;

		assert.equal(functionReferenceHover.language, 'scss');
		assert.equal(functionReferenceHover.value, '@function func() {…}');

		const functionDefenitionHover: IHover = <any>doHover(document, 62, cache, settings).contents;

		assert.equal(functionDefenitionHover.language, 'scss');
		assert.equal(functionDefenitionHover.value, '@function func() {…}');
	});

	it('issue-8', () => {
		const cache = getCacheStorage();

		cache.set('test.scss', {
			document: 'test.scss',
			variables: [],
			mixins: [
				{
					name: 'a',
					parameters: [],
					offset: 0
				},
				{
					name: 'b',
					parameters: [],
					offset: 0
				}
			],
			functions: [],
			imports: []
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true,
			suggestFunctions: true
		};

		const document = TextDocument.create('test.scss', 'scss', 1, [
			'@mixin a() {',
			'  @mixin b() {}',
			'  @include b();',
			'}'
		].join('\n'));

		// Mixin
		const mixinHover: IHover = <any>doHover(document, 40, cache, settings).contents;

		assert.equal(mixinHover.language, 'scss');
		assert.equal(mixinHover.value, '@mixin b() {…}');
	});

});
