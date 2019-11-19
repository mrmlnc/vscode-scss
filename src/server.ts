'use strict';

import {
	createConnection,
	IConnection,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	InitializeParams,
	InitializeResult,
	FileChangeType,
	Files
} from 'vscode-languageserver';

import { ISettings } from './types/settings';

import { getCacheStorage } from './services/cache';
import ScannerService from './services/scanner';

import { doCompletion } from './providers/completion';
import { doHover } from './providers/hover';
import { doSignatureHelp } from './providers/signatureHelp';
import { goDefinition } from './providers/goDefinition';
import { searchWorkspaceSymbol } from './providers/workspaceSymbol';
import { findFiles } from './utils/fs';

// Cache Storage
const cache = getCacheStorage();

// Common variables
let workspaceRoot: string;
let settings: ISettings;
let scannerService: ScannerService;

// Create a connection for the server
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a simple text document manager. The text document manager
// _supports full document sync only
const documents: TextDocuments = new TextDocuments();

// Make the text document manager listen on the connection
// _for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// _in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize(
	async (params: InitializeParams): Promise<InitializeResult> => {
		workspaceRoot = params.rootPath;
		settings = params.initializationOptions.settings;
		scannerService = new ScannerService(cache, settings);

		const files = await findFiles('**/*.scss', {
			cwd: params.rootPath,
			deep: settings.scannerDepth,
			ignore: settings.scannerExclude
		});

		try {
			await scannerService.scan(files);
		} catch (error) {
			if (settings.showErrors) {
				connection.window.showErrorMessage(error);
			}
		}

		return {
			capabilities: {
				textDocumentSync: documents.syncKind,
				completionProvider: { resolveProvider: false },
				signatureHelpProvider: {
					triggerCharacters: ['(', ',', ';']
				},
				hoverProvider: true,
				definitionProvider: true,
				workspaceSymbolProvider: true
			}
		};
	}
);

// Update settings
connection.onDidChangeConfiguration(params => {
	settings = params.settings.scss;
});

// Update cache
connection.onDidChangeWatchedFiles(event => {
	const files = event.changes
		.filter(file => file.type === FileChangeType.Changed || file.type === FileChangeType.Created)
		.map(file => Files.uriToFilePath(file.uri));

	return scannerService.scan(files, /* recursive */ false);
});

connection.onRequest('changeActiveDocument', () => undefined);

connection.onCompletion(textDocumentPosition => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doCompletion(document, offset, settings, cache);
});

connection.onHover(textDocumentPosition => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doHover(document, offset, cache, settings);
});

connection.onSignatureHelp(textDocumentPosition => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doSignatureHelp(document, offset, cache, settings);
});

connection.onDefinition(textDocumentPosition => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return goDefinition(document, offset, cache, settings);
});

connection.onWorkspaceSymbol(workspaceSymbolParams => {
	return searchWorkspaceSymbol(workspaceSymbolParams.query, cache, workspaceRoot);
});

// Dispose cache
connection.onShutdown(() => {
	cache.dispose();
});

// Listen on the connection
connection.listen();
