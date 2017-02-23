'use strict';

import {
	createConnection,
	IConnection,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	InitializeParams,
	InitializeResult
} from 'vscode-languageserver';

import { ISettings } from './types/settings';

import { getCacheStorage, invalidateCacheStorage } from './services/cache';
import { doScanner } from './services/scanner';

import { doCompletion } from './providers/completion';
import { doHover } from './providers/hover';
import { doSignatureHelp } from './providers/signatureHelp';
import { goDefinition } from './providers/goDefinition';
import { searchWorkspaceSymbol } from './providers/workspaceSymbol';

// Cache Storage
const cache = getCacheStorage();

// Common variables
let workspaceRoot: string;
let settings: ISettings;
let activeDocumentUri: string;

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
connection.onInitialize((params: InitializeParams): Promise<InitializeResult> => {
	workspaceRoot = params.rootPath;
	settings = params.initializationOptions.settings;
	activeDocumentUri = params.initializationOptions.activeEditorUri;

	return doScanner(workspaceRoot, cache, settings).then(() => {
		return <InitializeResult>{
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
connection.onDidChangeWatchedFiles((event) => {
	// We do not need to update the Cache if the current document has been updated
	if (event.changes.length === 1 && activeDocumentUri === event.changes[0].uri) {
		return;
	}

	return doScanner(workspaceRoot, cache, settings).then((symbols) => {
		return invalidateCacheStorage(cache, symbols);
	});
});

connection.onRequest('changeActiveDocument', (data: any) => {
	activeDocumentUri = data.uri;
});

connection.onCompletion((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doCompletion(workspaceRoot, document, offset, settings, cache);
});

connection.onHover((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doHover(workspaceRoot, document, offset, cache, settings);
});

connection.onSignatureHelp((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return doSignatureHelp(workspaceRoot, document, offset, cache, settings);
});

connection.onDefinition((textDocumentPosition) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);
	return goDefinition(workspaceRoot, document, offset, cache, settings);
});

connection.onWorkspaceSymbol((workspaceSymbolParams) => {
	return searchWorkspaceSymbol(workspaceSymbolParams.query, cache, workspaceRoot);
});

// Dispose cache
connection.onShutdown(() => {
	cache.dispose();
});

// Listen on the connection
connection.listen();
