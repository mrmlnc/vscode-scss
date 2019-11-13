import * as assert from 'assert';

import * as vscode from 'vscode';
import { CompletionItem, MarkupContent } from 'vscode-languageclient';
import { showFile } from '../util';

export async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedItems: (string | CompletionItem)[]
) {
	await showFile(docUri);

	const result = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		docUri,
		position
	)) as vscode.CompletionList;

	expectedItems.forEach(ei => {
		if (typeof ei === 'string') {
			assert.ok(
				result.items.some(i => {
					return i.label === ei;
				})
			);
		} else {
			const match = result.items.find(i => i.label === ei.label);
			if (!match) {
				assert.fail(`Can't find matching item for ${JSON.stringify(ei, null, 2)}`);
				return;
			}

			assert.equal(match.label, ei.label);
			if (ei.kind) {
				assert.equal(match.kind, ei.kind);
			}
			if (ei.detail) {
				assert.equal(match.detail, ei.detail);
			}

			if (ei.documentation) {
				if (typeof match.documentation === 'string') {
					assert.equal(match.documentation, ei.documentation);
				} else {
					if (ei.documentation && (ei.documentation as MarkupContent).value && match.documentation) {
						assert.equal(
							(match.documentation as vscode.MarkdownString).value,
							(ei.documentation as MarkupContent).value
						);
					}
				}
			}
		}
	});
}
