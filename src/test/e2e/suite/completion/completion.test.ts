import * as vscode from 'vscode';
import { getDocUri, showFile, position } from '../util';
import { testCompletion } from './helper';

describe('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	const docUri = getDocUri('main.scss');

	it('Offers variable completions', async () => {
		showFile(docUri);

		await testCompletion(docUri, position(5, 11), ['$color', '$fonts']);
	});
});
