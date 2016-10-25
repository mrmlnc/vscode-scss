'use strict';

import {
	createConnection,
	IConnection,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	InitializeParams,
	InitializeResult,
	Files
} from 'vscode-languageserver';

import { ISettings } from './types/settings';

import { getCacheStorage, invalidateCacheStorage } from './services/cache';
import { doScanner } from './services/scanner';

import { doCompletion } from './providers/completion';
import { doHover } from './providers/hover';
import { doSignatureHelp } from './providers/signatureHelp';

// Cache Storage
let cache = getCacheStorage();

// Common variables
let workspaceRoot: string;
let settings: ISettings;

// Create a connection for the server
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

// Drop cache for closed files
documents.onDidClose((event) => {
	const fsPath = Files.uriToFilePath(event.document.uri);

	cache.drop(fsPath);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize((params: InitializeParams): Promise<InitializeResult> => {
	workspaceRoot = params.rootPath;
	settings = params.initializationOptions.settings;

	return doScanner(workspaceRoot, cache, settings).then(() => {
		return <InitializeResult>{
			capabilities: {
				textDocumentSync: documents.syncKind,
				completionProvider: { resolveProvider: false },
				signatureHelpProvider: {
					triggerCharacters: ['(', ',', ';']
				},
				hoverProvider: true
			}
		};
	}).catch((err) => {
		if (settings.showErrors) {
			connection.window.showErrorMessage(err);
		}
	});
});

// Update settings
connection.onDidChangeConfiguration((params) => {
	settings = params.settings.scss;
});

// Update cache
connection.onDidChangeWatchedFiles((x) => {
	return doScanner(workspaceRoot, cache, settings).then((symbols) => {
		return invalidateCacheStorage(cache, symbols);
	});
});

connection.onCompletion((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doCompletion(document, offset, settings, cache);
});

connection.onHover((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doHover(document, offset, cache, settings);
});

connection.onSignatureHelp((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doSignatureHelp(document, offset, cache, settings);
});

// Dispose cache
connection.onShutdown(() => {
	cache.dispose();
});

// Listen on the connection
connection.listen();
