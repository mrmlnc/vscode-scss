'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import type {
	LanguageClientOptions,
	ServerOptions } from 'vscode-languageclient';
import {
	LanguageClient,
	TransportKind,
	RevealOutputChannelOn
} from 'vscode-languageclient';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	const serverModule = path.join(__dirname, 'unsafe/server.js');

	const runExecArgv: string[] = [];
	const scssPort = vscode.workspace.getConfiguration().get<number>('scss.dev.serverPort', -1);
	if (scssPort !== -1) {
		runExecArgv.push(`--inspect=${scssPort}`);
	}

	const debugOptions = {
		execArgv: ['--nolazy', '--inspect=6006']
	};

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: { execArgv: runExecArgv }
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: ['scss', 'vue'],
		synchronize: {
			configurationSection: ['scss'],
			fileEvents: vscode.workspace.createFileSystemWatcher('**/*.scss')
		},
		initializationOptions: {
			settings: vscode.workspace.getConfiguration('scss')
		},

		// Don't open the output console (very annoying) in case of error
		revealOutputChannelOn: RevealOutputChannelOn.Never
	};

	const client = new LanguageClient('scss-intellisense', 'SCSS IntelliSense', serverOptions, clientOptions);
	context.subscriptions.push(client.start());

	const promise = client.onReady().catch((error) => {
		console.log('Client initialization failed');
		console.error(error);
	});

	await vscode.window.withProgress(
		{
			title: 'SCSS IntelliSense initialization',
			location: vscode.ProgressLocation.Window
		},
		() => promise
	);
}
