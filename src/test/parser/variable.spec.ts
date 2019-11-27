'use strict';

import * as assert from 'assert';

import { makeVariable } from '../../parser/variable';
import * as helpers from '../helpers';

describe('Parser/Variable', () => {
	it('Simple', () => {
		const ast = helpers.makeAst([
			'$name: 1;'
		]).getChild(0);

		const variable = makeVariable(ast);

		assert.equal(variable.name, '$name');
		assert.equal(variable.value, '1');
	});

	it('Parameter', () => {
		const ast = helpers.makeAst([
			'@mixin a($a:1, $b) {',
			'  content: "1";',
			'}'
		]).getChild(0).getParameters().getChildren();

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
