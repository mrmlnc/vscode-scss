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

		// Don't open the output console (very annoying) in case of error
		revealOutputChannelOn: RevealOutputChannelOn.Never,
	};

	const client = new LanguageClient('scss-intellisense', 'SCSS IntelliSense', serverOptions, clientOptions);
	context.subscriptions.push(client.start());
	
	client.onReady().then(() => {
		const disposable = vscode.window.onDidChangeActiveTextEditor((event) => {
			let uri = null;
			if (event && event.document.uri.scheme === 'file') {
				uri = event.document.uri.toString();
			}

			client.sendRequest('changeActiveDocument', { uri });
		});

		context.subscriptions.push(disposable);
	})
}
