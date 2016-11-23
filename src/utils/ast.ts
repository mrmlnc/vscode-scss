'use strict';

import { INode, NodeType } from '../types/nodes';

/**
 * Get Node by offset position.
 */
export function getNodeAtOffset(parsedDocument: INode, posOffset: number): INode {
	let candidate: INode = null;

	parsedDocument.accept((node) => {
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
export function getParentNodeByType(node: INode, type: NodeType): INode {
	node = node.getParent();

	while (node.type !== type) {
		if (node.type === NodeType.Stylesheet) {
			return null;
		}

		node = node.getParent();
	}

	return node;
}

/**
 * Returns True, if node has Parent with specified type(s).
 */
export function hasParentsByType(node: INode, types: NodeType[]): boolean {
	node = node.getParent();

	while (node.type !== NodeType.Stylesheet) {
		if (types.indexOf(node.type) !== -1) {
			return true;
		}

		node = node.getParent();
	}

	return false;
}

/**
 * Returns the child Node of the specified type.
 */
export function getChildByType(parent: INode, type: NodeType): INode[] {
	return parent.getChildren().filter((node) => node.type === type);
}
