import * as path from 'path';

import * as vscode from 'vscode';
import type { LanguageClientOptions, NodeModule, ServerOptions } from 'vscode-languageclient';
import { LanguageClient, TransportKind, RevealOutputChannelOn } from 'vscode-languageclient';
import { EXTENSION_ID, EXTENSION_NAME } from './constants';

const EXTENSION_SERVER_MODULE_PATH = path.join(__dirname, 'unsafe/server.js');
const EXTENSION_DEFAULT_DEBUG_PORT = -1;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	const client = buildClient();

	context.subscriptions.push(client.start());

	const action = client.onReady()
		.catch((error: unknown) => {
			console.log('SCSS initialization failed');
			console.error(error);
		});

	await vscode.window.withProgress(
		{
			title: 'SCSS initialization',
			location: vscode.ProgressLocation.Window
		},
		() => action
	);
}

function buildClient(): LanguageClient {
	return new LanguageClient(EXTENSION_ID, EXTENSION_NAME, buildServerOptions(), buildClientOptions());
}

function buildServerOptions(): ServerOptions {
	const workspace = vscode.workspace.getConfiguration();
	const extensionServerPort = workspace.get<number>('scss.dev.serverPort', EXTENSION_DEFAULT_DEBUG_PORT);

	const configuration: NodeModule = {
		module: EXTENSION_SERVER_MODULE_PATH,
		transport: TransportKind.ipc,
		options: {
			execArgv: extensionServerPort === EXTENSION_DEFAULT_DEBUG_PORT ? [] : [`--inspect=${extensionServerPort}`]
		}
	};

	return {
		run: {
			...configuration
		},
		debug: {
			...configuration,
			options: {
				execArgv: ['--nolazy', '--inspect=6006']
			}
		}
	};
}

function buildClientOptions(): LanguageClientOptions {
	return {
		documentSelector: [{ scheme: 'file', language: 'scss' }],
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
}
