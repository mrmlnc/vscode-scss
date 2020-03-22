'use strict';

import * as assert from 'assert';

import {
	isVueFile,
	getVueSCSSRegions,
	getVueSCSSContent,
	getSCSSRegionsDocument
} from '../../utils/vue';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';

describe('Utils/Vue', () => {
	it('isVueFile', () => {
		assert.strictEqual(isVueFile('sdasdsa/AppButton.vue'), true);
		assert.strictEqual(isVueFile('sdasdsa/AppButton.scss.vue'), true);
		assert.strictEqual(isVueFile('sdasdsa/AppButton.vue.ts'), false);
		assert.strictEqual(isVueFile('sdasdsa/sdadsf.ts'), false);
		assert.strictEqual(isVueFile('sda.vue/AppButton.scss'), false);
		assert.strictEqual(isVueFile('sdasdsa/AppButton.vue.scss'), false);
	});

	it('getVueSCSSRegions', () => {
		assert.deepStrictEqual(getVueSCSSRegions('<style sdad lang="scss" afsaf sdd></style>'), [[34, 34]]);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang="scss" scoped></style>'), [[26, 26]]);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang="scss" module></style>'), [[26, 26]]);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang="scss"></style>'), [[19, 19]]);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang=\'scss\'></style>'), [[19, 19]]);

		assert.deepStrictEqual(getVueSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'></style>'), [[90, 90]]);
		assert.deepStrictEqual(getVueSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'></style>'), [[91, 91]]);
		assert.deepStrictEqual(getVueSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'>\n</style>'), [[91, 92]]);
		assert.deepStrictEqual(getVueSCSSRegions('<template><p>style lang=\'scss\'</p></template><script></script></script>\n<style lang=\'scss\'>a { color: white; }</style>'), [[91, 110]]);

		assert.deepStrictEqual(getVueSCSSRegions(
			`<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'>a { color: white; }</style><style lang=\'scss\' module>a { color: white; }</style>\n`)
		, [[90, 109], [143, 162]]);
		assert.deepStrictEqual(getVueSCSSRegions(
			`<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'>a { color: white; }</style><style lang=\'scss\' module>a { color: white; }</style>\n\n<style lang=\'scss\' module="a">a { color: white; }</style>`)
		, [[90, 109], [143, 162], [202, 221]]);

		assert.deepStrictEqual(getVueSCSSRegions('<style lang="sass"></style>'), []);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang="stylus"></style>'), []);
		assert.deepStrictEqual(getVueSCSSRegions('<style lang="sass" scoped></style>'), []);
		assert.deepStrictEqual(getVueSCSSRegions('<style></style>'), []);
		assert.deepStrictEqual(getVueSCSSRegions('<style>lang="scss"</style>'), []);
	});

	it('getVueSCSSContent', () => {
		assert.strictEqual(getVueSCSSContent('sadja|sio|fuioaf', [[5, 10]]), '     |sio|      ');
		assert.strictEqual(getVueSCSSContent('sadja|sio|fuio^af^', [[5, 10], [14, 18]]), '     |sio|    ^af^');

		assert.strictEqual(getVueSCSSContent('<template><p>style lang=\'scss\'</p></template><script></script></script><style lang=\'scss\'> a\n { color: white;  }</style>'), ' '.repeat(90) + ' a\n { color: white;  }' + ' '.repeat(8));
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
