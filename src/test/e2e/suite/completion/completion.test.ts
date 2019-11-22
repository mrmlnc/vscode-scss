import * as vscode from 'vscode';
import { getDocUri, showFile, position, sleep } from '../util';
import { testCompletion } from './helper';

describe('SCSS Completion Test', () => {
	vscode.window.showInformationMessage('Start all tests.');
	const docUri = getDocUri('main.scss');

	before(async () => {
		showFile(docUri);
		await sleep(10000);
	});

	it('Offers variable completions', async () => {
		await testCompletion(docUri, position(5, 11), ['$color', '$fonts']);
	});

	it('Offers completions from tilde imports', async () => {
		await testCompletion(docUri, position(11, 11), ['$tilde']);
	});

	it('Offers completions from partial file', async () => {
		await testCompletion(docUri, position(17, 11), ['$partial']);
	});
});
