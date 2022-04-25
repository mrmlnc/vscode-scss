'use strict';

import * as assert from 'assert';

import {
	isVueOrSvelteFile,
	getSCSSRegions,
	getSCSSContent,
	getSCSSRegionsDocument
} from '../../utils/vue-svelte';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';

describe('Utils/VueSvelte', () => {
	it('isVueOrSvelteFile', () => {
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.vue'), true);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.scss.vue'), true);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.vue.ts'), false);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/sdadsf.ts'), false);
		assert.strictEqual(isVueOrSvelteFile('sda.vue/AppButton.scss'), false);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.vue.scss'), false);

		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.svelte'), true);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.scss.svelte'), true);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.svelte.ts'), false);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/sdadsf.ts'), false);
		assert.strictEqual(isVueOrSvelteFile('sda.vue/AppButton.scss'), false);
		assert.strictEqual(isVueOrSvelteFile('sdasdsa/AppButton.svelte.scss'), false);
	});

	it('getSCSSRegions', () => {
		assert.deepStrictEqual(getSCSSRegions('<style sdad lang="scss" afsaf sdd></style>'), [[34, 34]]);
		assert.deepStrictEqual(getSCSSRegions('<style lang="scss" scoped></style>'), [[26, 26]]);
		assert.deepStrictEqual(getSCSSRegions('<style lang="scss" module></style>'), [[26, 26]]);
		assert.deepStrictEqual(getSCSSRegions('<style lang="scss"></style>'), [[19, 19]]);
		assert.deepStrictEqual(getSCSSRegions('<style lang=\'scss\'></style>'), [[19, 19]]);
		assert.deepStrictEqual(getSCSSRegions('<style type="text/scss"></style>'), [[24, 24]]);

		assert.deepStrictEqual(getSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'></style>'), [[90, 90]]);
		assert.deepStrictEqual(getSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'></style>'), [[91, 91]]);
		assert.deepStrictEqual(getSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'>\n</style>'), [[91, 92]]);
		assert.deepStrictEqual(getSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'>a { color: white; }</style>'), [[91, 110]]);

		assert.deepStrictEqual(getSCSSRegions(
			`<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'>a { color: white; }</style><style lang=\'scss\' module>a { color: white; }</style>\n`)
		, [[90, 109], [143, 162]]);
		assert.deepStrictEqual(getSCSSRegions(
			`<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'>a { color: white; }</style><style lang=\'scss\' module>a { color: white; }</style>\n\n<style lang=\'scss\' module="a">a { color: white; }</style>`)
		, [[90, 109], [143, 162], [202, 221]]);

		assert.deepStrictEqual(getSCSSRegions('<style lang="sass"></style>'), []);
		assert.deepStrictEqual(getSCSSRegions('<style lang="stylus"></style>'), []);
		assert.deepStrictEqual(getSCSSRegions('<style lang="sass" scoped></style>'), []);
		assert.deepStrictEqual(getSCSSRegions('<style></style>'), []);
		assert.deepStrictEqual(getSCSSRegions('<style>lang="scss"</style>'), []);
	});

	it('getSCSSContent', () => {
		assert.strictEqual(getSCSSContent('sadja|sio|fuioaf', [[5, 10]]), '     |sio|      ');
		assert.strictEqual(getSCSSContent('sadja|sio|fuio^af^', [[5, 10], [14, 18]]), '     |sio|    ^af^');

		assert.strictEqual(getSCSSContent('<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'> a\n { color: white;  }</style>'), ' '.repeat(90) + ' a\n { color: white;  }' + ' '.repeat(8));
	});

	it('getSCSSRegionsDocument', () => {
		const exSCSSDocument = TextDocument.create('sdfdsf.vue/sasfsf.scss', 'scss', 1, '');
		assert.strictEqual(getSCSSRegionsDocument(exSCSSDocument, Position.create(0, 0)).document, exSCSSDocument);

		const exVueDocument = TextDocument.create('components/AppButton.vue', 'vue', 1, `
			<template>
				<button>@import "mixin.scss";</button>
			</template>
			<style lang="scss">
				@import "variables.scss";
			</style>
		`);
		assert.notDeepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(2, 15)).document, exVueDocument);
		assert.deepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(2, 15)).document, null);

		assert.notDeepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(5, 15)).document, exVueDocument);
		assert.notDeepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(5, 15)).document, null);

		assert.notDeepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(6, 9)).document, exVueDocument);
		assert.deepStrictEqual(getSCSSRegionsDocument(exVueDocument, Position.create(6, 9)).document, null);
	});
});
