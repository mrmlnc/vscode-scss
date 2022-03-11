'use strict';

export interface ISettings {
	// Scanner
	scannerRoot: string;
	scannerDepth: number;
	scannerExclude: string[];
	scanImportedFiles: boolean;

	// Label
	implicitlyLabel: string | null;

	// Display
	showErrors: boolean;

	// Suggestions
	suggestVariables: boolean;
	suggestMixins: boolean;
	suggestFunctions: boolean;
	suggestFunctionsInStringContextAfterSymbols: string;
}
