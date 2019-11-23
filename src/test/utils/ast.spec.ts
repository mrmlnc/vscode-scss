'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getSCSSLanguageService } from 'vscode-css-languageservice';

import { INode, NodeType } from '../../types/nodes';
import {
	getNodeAtOffset,
	getParentNodeByType,
	hasParentsByType,
	getChildByType
} from '../../utils/ast';

const ls = getSCSSLanguageService();

ls.configure({
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.dcdd', 'dcdd', 1, text.join('\n'));
	return <INode>ls.parseStylesheet(doc);
}

describe('Utils/Ast', () => {
	it('getNodeAtOffset', () => {
		const ast = parseText([
			'.a {}'
		]);

		const node = getNodeAtOffset(ast, 4);

		assert.equal(node.type, NodeType.Declarations);
		assert.equal(node.getText(), '{}');
	});

	it('getParentNodeByType', () => {
		const ast = parseText([
			'.a {}'
		]);

		const node = getNodeAtOffset(ast, 4);
		const parentNode = getParentNodeByType(node, NodeType.Ruleset);

		assert.equal(parentNode.type, NodeType.Ruleset);
		assert.equal(parentNode.getText(), '.a {}');
	});

	it('hasParentsByType', () => {
		const ast = parseText([
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
		const ast = parseText([
			'$a: 1;',
			'$b: 2;'
		]);

		assert.equal(getChildByType(ast, NodeType.VariableDeclaration).length, 2);
	});
});
