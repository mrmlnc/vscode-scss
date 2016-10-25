'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../../types/nodes';
import { findSymbols, findSymbolsAtOffset } from '../../parser/symbols';

const ls = getSCSSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.scss', 'scss', 1, text.join('\n'));
	return <INode>ls.parseStylesheet(doc);
}

describe('Parser/Symbols', () => {

	it('findSymbols - Variables', () => {
		const text = [
			'$a: 1;',
			'.a {',
			'  $b: 2;',
			'}'
		].join('\n');

		const { variables } = findSymbols(text);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '$a');
		assert.equal(variables[0].value, '1');
	});

	it('findSymbols - Mixins', () => {
		const text = [
			'@mixin a() {}',
			'.a {',
			'  @mixin b() {}',
			'}',
			'@mixin c() {',
			'  @mixin d() {}',
			'}'
		].join('\n');

		const { mixins } = findSymbols(text);

		assert.equal(mixins.length, 2);

		assert.equal(mixins[0].name, 'a');
		assert.equal(mixins[1].name, 'c');
	});

	it('findSymbols - Functions', () => {
		const text = [
			'@function a($arg) {',
			'  @return $arg;',
			'}'
		].join('\n');

		const { functions } = findSymbols(text);

		assert.equal(functions.length, 1);

		assert.equal(functions[0].name, 'a');
	});

	it('findSymbols - Imports', () => {
		const text = [
			'@import "styles.scss";',
			'@import "styles.css";',
			'@import "@{styles}.scss";',
			'@import "styles/**/*.scss";'
		].join('\n');

		const { imports } = findSymbols(text);

		assert.equal(imports.length, 4);

		assert.equal(imports[0].filepath, 'styles.scss');
		assert.equal(imports[1].filepath, 'styles.css');
		assert.equal(imports[2].filepath, '@{styles}.scss');
		assert.equal(imports[3].filepath, 'styles/**/*.scss');
	});

	it('findSymbolsAtOffset - Variables', () => {
		const ast = parseText([
			'$a: 1;',
			'.a {',
			'  $b: 2;',
			'}'
		]);

		const { variables } = findSymbolsAtOffset(ast, 21);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '$b');
		assert.equal(variables[0].value, '2');
	});

	it('findSymbolsAtOffset - Mixins', () => {
		const ast = parseText([
			'@mixin a() {}',
			'.a {',
			'  @mixin b() {}',
			'}',
			'@mixin c() {',
			'  @mixin d() {}',
			'}'
		]);

		// @mixin a() {__0__}
		// .a {__1__
		//   @mixin b() {__2__}
		// }__3__
		// @mixin c() {__4__
		//   @mixin d() {__5__}
		// }__6__

		assert.equal(findSymbolsAtOffset(ast, 12).mixins.length, 0, '__0__');
		assert.equal(findSymbolsAtOffset(ast, 18).mixins.length, 1, '__1__');
		assert.equal(findSymbolsAtOffset(ast, 33).mixins.length, 1, '__2__');
		assert.equal(findSymbolsAtOffset(ast, 36).mixins.length, 1, '__3__');
		assert.equal(findSymbolsAtOffset(ast, 49).mixins.length, 1, '__4__');
		assert.equal(findSymbolsAtOffset(ast, 64).mixins.length, 1, '__5__');
		assert.equal(findSymbolsAtOffset(ast, 67).mixins.length, 1, '__6__');
	});

	it('findSymbolsAtOffset - Functions', () => {
		const ast = parseText([
			'@function name($a: 1) { @return  }'
		]);

		const { variables } = findSymbolsAtOffset(ast, 32);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '$a');
		assert.equal(variables[0].value, '1');
	});

});
