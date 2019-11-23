'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../../types/nodes';
import { makeVariable } from '../../parser/variable';

const ls = getSCSSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.scss', 'scss', 1, text.join('\n'));
	return (<INode>ls.parseStylesheet(doc)).getChildren()[0];
}

describe('Parser/Variable', () => {
	it('Simple', () => {
		const ast = parseText([
			'$name: 1;'
		]);

		const variable = makeVariable(ast);

		assert.equal(variable.name, '$name');
		assert.equal(variable.value, '1');
	});

	it('Parameter', () => {
		const ast = parseText([
			'@mixin a($a:1, $b) {',
			'  content: "1";',
			'}'
		]).getParameters().getChildren();

		const vars = {
			one: makeVariable(ast[0], 'a'),
			two: makeVariable(ast[1], 'a')
		};

		assert.equal(vars.one.name, '$a');
		assert.equal(vars.one.mixin, 'a');
		assert.equal(vars.one.value, '1');

		assert.equal(vars.two.name, '$b');
		assert.equal(vars.two.mixin, 'a');
		assert.equal(vars.two.value, null);
	});
});
