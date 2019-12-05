'use strict';

import * as assert from 'assert';

import { NodeType } from '../../types/nodes';
import {
	getNodeAtOffset,
	getParentNodeByType
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
});
