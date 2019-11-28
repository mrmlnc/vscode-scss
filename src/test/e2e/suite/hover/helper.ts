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

	const contents = result[0].contents;
	contents.forEach((c, i) => {
		const val = (c as any).value;
		assert.equal(val, expectedHover.contents[i]);
	});

	if (expectedHover.range && result[0] && result[0].range) {
		assert.ok(result[0].range!.isEqual(expectedHover.range!));
	}
}
