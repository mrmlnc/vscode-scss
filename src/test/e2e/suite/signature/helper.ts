import * as assert from 'assert';

import * as vscode from 'vscode';

import { showFile } from '../util';

export async function testSignature(docUri: vscode.Uri, position: vscode.Position, signature: vscode.SignatureHelp) {
	await showFile(docUri);

	const result = await vscode.commands.executeCommand<vscode.SignatureHelp>(
		'vscode.executeSignatureHelpProvider',
		docUri,
		position
	);

	assert.equal(result.activeParameter, signature.activeParameter, 'activeParameter');
	assert.equal(result.activeSignature, signature.activeSignature, 'activeSignature');

	assert.equal(
		result.signatures.length,
		signature.signatures.length,
		`Count of signatures: ${signature.signatures.length} expected; ${result.signatures.length} actual`
	);

	signature.signatures.forEach((expectedSignature, i) => {
		const actualSignature = result.signatures[i];
		assert.equal(actualSignature.label, expectedSignature.label);

		assert.equal(
			actualSignature.parameters.length,
			expectedSignature.parameters.length,
			`Count of parameters for {expectedSignature.label}: ${expectedSignature.parameters.length} expected; ${actualSignature.parameters.length} actual`
		);
	});
}
