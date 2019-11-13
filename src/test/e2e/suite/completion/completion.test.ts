import * as vscode from 'vscode';
import { getDocUri, showFile, position, sleep } from '../util';
import { testCompletion } from './helper';

describe('SCSS Completion Test', () => {
	vscode.window.showInformationMessage('Start all tests.');
	const docUri = getDocUri('main.scss');

	before(async () => {
		showFile(docUri);
		await sleep(2000);
	});

	it('Offers variable completions', async () => {
		await testCompletion(docUri, position(7, 11), ['$color', '$fonts']);
	});

	it('Offers completions from tilde imports', async () => {
		await testCompletion(docUri, position(7, 11), ['$tilde-var']);
	});
});
