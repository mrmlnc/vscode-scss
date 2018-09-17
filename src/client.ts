'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	RevealOutputChannelOn
} from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {
	const serverModule = path.join(__dirname, 'server.js');

	const debugOptions = {
		execArgv: ['--nolazy', '--debug=6004']
	};

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	const activeEditor = vscode.window.activeTextEditor;

	const clientOptions: LanguageClientOptions = {
		documentSelector: ['scss'],
		synchronize: {
			configurationSection: ['scss'],
			fileEvents: vscode.workspace.createFileSystemWatcher('**/*.scss')
		},
		initializationOptions: {
			settings: vscode.workspace.getConfiguration('scss'),
			activeEditorUri: activeEditor ? activeEditor.document.uri.toString() : null
		},

		// Don't open the output console
		// automatically because of us
		revealOutputChannelOn: RevealOutputChannelOn.Never,
	};

	const client = new LanguageClient('scss-intellisense', 'SCSS IntelliSense', serverOptions, clientOptions);

	const disposable: vscode.Disposable[] = [];
	disposable[0] = client.start();
	disposable[1] = vscode.window.onDidChangeActiveTextEditor((event) => {
		let uri = null;
		if (event && event.document.uri.scheme === 'file') {
			uri = event.document.uri.toString();
		}

		client.sendRequest('changeActiveDocument', { uri });
	});

	context.subscriptions.push(...disposable);
}
