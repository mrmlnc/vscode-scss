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

	while (true) {
		if (node.type === NodeType.Stylesheet) {
			return null;
		} else if (node.type === type) {
			break;
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

	while (true) {
		if (node.type === NodeType.Stylesheet) {
			return false;
		} else if (types.indexOf(node.type) !== -1) {
			return true;
		}

		node = node.getParent();
	}
}

/**
 * Returns the child Node of the specified type.
 */
export function getChildByType(parent: INode, type: NodeType): INode[] {
	let childs = parent.getChildren().filter((node) => node.type === type);

	return childs.length ? childs : null;
}
