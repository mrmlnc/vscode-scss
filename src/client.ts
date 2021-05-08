import * as path from 'path';

import * as vscode from 'vscode';
import type { URI } from 'vscode-uri';
import type { LanguageClientOptions, NodeModule, ServerOptions } from 'vscode-languageclient/node';
import { LanguageClient, TransportKind, RevealOutputChannelOn } from 'vscode-languageclient/node';

import { EXTENSION_ID, EXTENSION_NAME } from './constants';

const EXTENSION_SERVER_MODULE_PATH = path.join(__dirname, './unsafe/server.js');
const EXTENSION_DEFAULT_DEBUG_PORT = -1;

const clients: Map<string, LanguageClient> = new Map<string, LanguageClient>();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(changeWorkspaceFoldersEventHandler),
		vscode.window.onDidChangeActiveTextEditor(changeActiveTextEditorEventHandler)
	);

	await changeActiveTextEditorEventHandler(vscode.window.activeTextEditor);
}

export async function deactivate(): Promise<void> {
	await Promise.all([...clients.values()].map((client) => client.stop()));
}

async function changeWorkspaceFoldersEventHandler(event: vscode.WorkspaceFoldersChangeEvent): Promise<void> {
	await Promise.all(event.removed.map((folder) => clients.get(folder.uri.fsPath)?.stop()));
}

async function changeActiveTextEditorEventHandler(editor: vscode.TextEditor | undefined): Promise<void> {
	const document = editor?.document;
	const uri = document?.uri;

	/**
	 * Here the `scheme` field may not be `file` when the active window is a panel like `output`.
	 * The plugin only works with files, so other types of editors are ignored.
	 */
	if (uri?.scheme !== 'file') {
		return;
	}

	const workspace = vscode.workspace.getWorkspaceFolder(uri);

	if (workspace === undefined || clients.has(workspace.uri.toString())) {
		return;
	}

	await initializeClient(workspace);
}

async function initializeClient(workspace: vscode.WorkspaceFolder): Promise<LanguageClient> {
	const client = buildClient(workspace.uri);

	clients.set(workspace.uri.toString(), client);

	return vscode.window.withProgress(
		{
			title: `[${workspace.name}] Starting SCSS server`,
			location: vscode.ProgressLocation.Window
		},
		async () => {
			client.start();

			try {
				await client.onReady();
			} catch (error: unknown) {
				await vscode.window.showErrorMessage(`Client initialization failed. ${(error as Error).stack ?? '<empty_stack>'}`);
			}

			return client;
		}
	);
}

function buildClient(workspace: URI): LanguageClient {
	return new LanguageClient(EXTENSION_ID, EXTENSION_NAME, buildServerOptions(workspace), buildClientOptions(workspace));
}

function buildServerOptions(workspace: URI): ServerOptions {
	const extensionServerPort = vscode.workspace.getConfiguration('scss.dev', workspace).get<number>('serverPort', EXTENSION_DEFAULT_DEBUG_PORT);

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

function buildClientOptions(workspace: URI): LanguageClientOptions {
	/**
	 * The workspace path is used to separate clients in multi-workspace environment.
	 * Otherwise, each client will participate in each workspace.
	 */
	const pattern = `${workspace.fsPath.replace(/\\/g, '/')}/**`;

	return {
		documentSelector: [
			{ scheme: 'file', language: 'scss', pattern },
			{ scheme: 'file', language: 'vue', pattern }
		],
		synchronize: {
			configurationSection: ['scss'],
			fileEvents: vscode.workspace.createFileSystemWatcher({
				base: workspace.fsPath,
				pattern: '**/*.scss'
			})
		},
		initializationOptions: {
			workspace: workspace.fsPath,
			settings: vscode.workspace.getConfiguration('scss', workspace)
		},
		// Don't open the output console (very annoying) in case of error
		revealOutputChannelOn: RevealOutputChannelOn.Never
	};
}
