'use strict';

import * as assert from 'assert';

import { INode, NodeType } from '../../types/nodes';
import { makeMixin } from '../../parser/mixin';
import * as helpers from '../helpers';

describe('Parser/Mixin', () => {
	it('Simple', () => {
		const ast = helpers.makeAst([
			'@mixin a() {',
			'  content: "1"',
			'}'
		]);

		const mixin = makeMixin(ast.getChild(0));

		assert.equal(mixin.name, 'a');
		assert.equal(mixin.parameters.length, 0);
	});

	it('Parameters', () => {
		const ast = helpers.makeAst([
			'@mixin a($a: 1, $b) {',
			'  content: "1";',
			'}'
		]);

		const mixin = makeMixin(ast.getChild(0));

		assert.equal(mixin.name, 'a');

		assert.equal(mixin.parameters[0].name, '$a');
		assert.equal(mixin.parameters[0].value, '1');

		assert.equal(mixin.parameters[1].name, '$b');
		assert.equal(mixin.parameters[1].value, null);
	});

	it('Nesting', done => {
		const ast = helpers.makeAst([
			'.a-#{$name} {',
			'  @mixin b($a: 1, $b) {',
			'    content: "1";',
			'  }',
			'}'
		]);

		ast.accept((node: INode) => {
			if (node.type === NodeType.MixinDeclaration) {
				const mixin = makeMixin(node);

				assert.equal(mixin.name, 'b');

				assert.equal(mixin.parameters[0].name, '$a');
				assert.equal(mixin.parameters[0].value, '1');

				assert.equal(mixin.parameters[1].name, '$b');
				assert.equal(mixin.parameters[1].value, null);

				done();
			}

			return true;
		});
	});
});
