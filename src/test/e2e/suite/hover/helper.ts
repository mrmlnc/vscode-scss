import * as assert from 'assert';

import * as vscode from 'vscode';

import { showFile } from '../util';

export async function testHover(docUri: vscode.Uri, position: vscode.Position, expectedHover: vscode.Hover) {
	await showFile(docUri);

	const result = (await vscode.commands.executeCommand(
		'vscode.executeHoverProvider',
		docUri,
		position
	)) as vscode.Hover[];

	if (!result[0]) {
		throw Error('Hover failed');
	}

	const contents = result
		.map(item => {
			return item.contents.map((content: any) => content.value);
		})
		.join('\n');

	// We use `.includes` here because the hover can contain content from other plugins.
	assert.ok(contents.includes(expectedHover.contents.join('')));

	if (expectedHover.range && result[0] && result[0].range) {
		assert.ok(result[0].range!.isEqual(expectedHover.range!));
	}
}
