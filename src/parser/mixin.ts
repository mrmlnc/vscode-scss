'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable, IMixin } from '../types/symbols';

import { makeVariable } from './variable';
import { getChildByType } from '../utils/ast';

/**
 * Returns information about Mixin Declaraion.
 */
export function makeMixin(node: INode): IMixin {
	const name = node.getName();
	let params: IVariable[] = [];

	node.getParameters().getChildren().forEach((child) => {
		if (child.getName()) {
			params.push(makeVariable(child, name));
		}
	});

	return {
		name,
		parameters: params,
		offset: node.offset
	};
}

/**
 * Returns information about set of Variable Declarations.
 */
export function makeMixinCollection(node: INode): IMixin[] {
	const mixinNodes = getChildByType(node, NodeType.MixinDeclaration);
	if (!mixinNodes) {
		return [];
	}

	const variables: IMixin[] = [];
	for (let i = 0; i < mixinNodes.length; i++) {
		variables.push(makeMixin(mixinNodes[i]));
	}

	return variables;
}
