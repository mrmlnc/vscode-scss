import * as assert from 'assert';

import * as vscode from 'vscode';

import { showFile } from '../util';

export async function testDefinition(docUri: vscode.Uri, position: vscode.Position, expectedLocation: vscode.Location) {
	await showFile(docUri);

	const result = (await vscode.commands.executeCommand(
		'vscode.executeDefinitionProvider',
		docUri,
		position
	)) as vscode.Location[];

	assert.ok(result[0].range.isEqual(expectedLocation.range));
	assert.equal(result[0].uri.fsPath, expectedLocation.uri.fsPath);
}
