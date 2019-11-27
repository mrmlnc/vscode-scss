'use strict';

import * as assert from 'assert';

import { NodeType } from '../../types/nodes';
import {
	getNodeAtOffset,
	getParentNodeByType,
	hasParentsByType,
	getChildByType
} from '../../utils/ast';
import * as helpers from '../helpers';

describe('Utils/Ast', () => {
	it('getNodeAtOffset', () => {
		const ast = helpers.makeAst([
			'.a {}'
		]);

		const node = getNodeAtOffset(ast, 4);

		assert.equal(node.type, NodeType.Declarations);
		assert.equal(node.getText(), '{}');
	});

	it('getParentNodeByType', () => {
		const ast = helpers.makeAst([
			'.a {}'
		]);

		const node = getNodeAtOffset(ast, 4);
		const parentNode = getParentNodeByType(node, NodeType.Ruleset);

		assert.equal(parentNode.type, NodeType.Ruleset);
		assert.equal(parentNode.getText(), '.a {}');
	});

	it('hasParentsByType', () => {
		const ast = helpers.makeAst([
			'@mixin a() {',
			'  $name: 1;',
			'}'
		]);

		// Stylesheet -> MixinDeclaration -> Nodelist
		const node = ast.getChild(0).getChild(1);

		assert.ok(hasParentsByType(node, [NodeType.MixinDeclaration]));
		assert.ok(!hasParentsByType(node, [NodeType.Document]));
	});

	it('getChildByType', () => {
		const ast = helpers.makeAst([
			'$a: 1;',
			'$b: 2;'
		]);

		assert.equal(getChildByType(ast, NodeType.VariableDeclaration).length, 2);
	});
});
