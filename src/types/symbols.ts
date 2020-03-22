'use strict';

import { Position } from 'vscode-languageserver-textdocument';
import { IVariable as IVar, IMixin as IMix, IFunction as IFun, IImport as IImp } from 'scss-symbols-parser';
import { INode } from './nodes';

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

export interface ISymbols {
	/**
	 * The imported path in the document.
	 */
	document?: string;
	/**
	 * The real path to the file on the file system.
	 */
	filepath?: string;
	variables: IVariable[];
	mixins: IMixin[];
	functions: IFunction[];
	imports: IImport[];
}

export interface IDocument {
	node: INode;
	symbols: ISymbols;
}
