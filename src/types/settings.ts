'use strict';

export interface ISettings {
	// Scanner
	scannerDepth: number;
	scannerExclude: string[];
	scanImportedFiles: boolean;
	scanImportedFilesDepth: number;

	// Label
	implicitlyLabel: string;

	// Display
	showErrors: boolean;

	// Suggestions
	suggestVariables: boolean;
	suggestMixins: boolean;
	suggestFunctions: boolean;
	suggestFunctionsInStringContextAfterSymbols: string;
}
