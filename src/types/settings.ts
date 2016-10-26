'use strict';

export interface ISettings {
	// Scanner
	scannerDepth: number;
	scannerExclude: string[];
	scanImportedFiles: boolean;
	scanImportedFilesDepth: number;

	// Display
	showErrors: boolean;
	showImplicitlyLabel: boolean;

	// Suggestions
	suggestVariables: boolean;
	suggestMixins: boolean;
	suggestFunctions: boolean;
}
