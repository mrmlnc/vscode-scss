'use strict';

import { INode, NodeType } from '../types/nodes';

/**
 * Get Node by offset position.
 */
export function getNodeAtOffset(parsedDocument: INode, posOffset: number): INode {
	let candidate: INode = null;

	parsedDocument.accept(node => {
		if (node.offset === -1 && node.length === -1) {
			return true;
		} else if (node.offset <= posOffset && node.end >= posOffset) {
			if (!candidate) {
				candidate = node;
			} else if (node.length <= candidate.length) {
				candidate = node;
			}
			return true;
		}
		return false;
	});

	return candidate;
}

/**
 * Returns the parent Node of the specified type.
 */
export function getParentNodeByType(node: INode, type: NodeType): INode | null {
	node = node.getParent();

	while (node.type !== type) {
		if (node.type === NodeType.Stylesheet) {
			return null;
		}

		node = node.getParent();
	}

	return node;
}
