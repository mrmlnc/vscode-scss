import * as assert from 'assert';

import * as vscode from 'vscode';
import type { CompletionItem, MarkupContent } from 'vscode-languageclient';
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

			assert.strictEqual(match.label, ei.label);
			if (ei.kind) {
				assert.strictEqual(match.kind, ei.kind);
			}
			if (ei.detail) {
				assert.strictEqual(match.detail, ei.detail);
			}

			if (ei.documentation) {
				if (typeof match.documentation === 'string') {
					assert.strictEqual(match.documentation, ei.documentation);
				} else {
					if (ei.documentation && (ei.documentation as MarkupContent).value && match.documentation) {
						assert.strictEqual(
							(match.documentation as vscode.MarkdownString).value,
							(ei.documentation as MarkupContent).value
						);
					}
				}
			}
		}
	});
}
