'use strict';

import * as assert from 'assert';

import { makeVariable } from '../../parser/variable';
import * as helpers from '../helpers';

describe('Parser/Variable', () => {
	it('Simple', () => {
		const node = helpers.makeAst([
			'$name: 1;'
		]).getChild(0);

		const variable = makeVariable(node);

		assert.equal(variable.name, '$name');
		assert.equal(variable.value, '1');
	});

	it('Parameter', () => {
		const node = helpers.makeAst([
			'@mixin a($a:1, $b) {',
			'  content: "1";',
			'}'
		]).getChild(0).getParameters().getChildren();

		const variables = {
			one: makeVariable(node[0], 'a'),
			two: makeVariable(node[1], 'a')
		};

		assert.equal(variables.one.name, '$a');
		assert.equal(variables.one.mixin, 'a');
		assert.equal(variables.one.value, '1');

		assert.equal(variables.two.name, '$b');
		assert.equal(variables.two.mixin, 'a');
		assert.equal(variables.two.value, null);
	});
});
