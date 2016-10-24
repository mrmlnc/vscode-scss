'use strict';

import { IVariable as IVar, IMixin as IMix, IFunction as IFun, IImport as IImp } from 'scss-symbols-parser';
import { INode } from './nodes';

export interface IVariable extends IVar {
	mixin?: string;
}

export interface IMixin extends IMix {
  // :)
}

export interface IFunction extends IFun {
  // :)
}

export interface IImport extends IImp {
	reference?: boolean;
}

export interface ISymbols {
	document?: string;
	ctime?: Date;
	variables: IVariable[];
	mixins: IMixin[];
	functions: IFunction[];
	imports: IImport[];
}

export interface IDocument {
	ast: INode;
	symbols: ISymbols;
}
