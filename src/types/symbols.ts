'use strict';

import type { Position } from 'vscode-languageserver-textdocument';
import type { IVariable as IVar, IMixin as IMix, IFunction as IFun, IImport as IImp } from 'scss-symbols-parser';
import type { INode } from './nodes';

export interface IVariable extends IVar {
	position?: Position;
	mixin?: string;
}

export interface IMixin extends IMix {
	position?: Position;
}

export interface IFunction extends IFun {
	position?: Position;
}

export interface IImport extends IImp {
	reference?: boolean;
}

export interface IDocumentSymbols extends ISymbols {
	/**
	 * The imported path in the document.
	 */
	document?: string;
	/**
	 * The real path to the file on the file system.
	 */
	filepath?: string;
}

export interface ISymbols {
	variables: IVariable[];
	mixins: IMixin[];
	functions: IFunction[];
	imports: IImport[];
}

export interface IDocument {
	node: INode | null;
	symbols: IDocumentSymbols;
}
