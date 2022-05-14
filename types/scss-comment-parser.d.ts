/// <reference types="node" />

declare module "scss-comment-parser" {
	import { EventEmitter } from "events";

	export default Parser;

	export interface Annotation {
		name: string;
		alias?: string[];
	}

	export interface Annotations {
		list: Omit<{ [x: string]: Annotation }, "_"> & {
			_: { alias: Map<string, string> };
		};
	}

	export interface ParserConfig {
		lineComment?: boolean;
		blockComment?: boolean;
		lineCommentStyle?: string;
		blockCommentStyle?: string;
	}

	export type Range = {
		start: number;
		end: number;
	};

	export type ContextType =
		| "unknown"
		| "function"
		| "mixin"
		| "placeholder"
		| "variable"
		| "css";

	export interface Context {
		type: ContextType;
		name: string;
		value?: string;
		scope?: "private" | "global";
		code?: string;
		line: Range;
	}

	export interface ParseResult {
		description: string;
		commentRange: Range;
		context: Context;
	}

	class CommentParser extends EventEmitter {
		parse(code: string, id?: string): Array<ParseResult>;
	}

	class Parser {
		/**
		 * @see cdocparser
		 */
		constructor(annotations: Annotations, config?: ParserConfig);

		commentParser: CommentParser;

		parse(code: string, id?: string): Array<ParseResult>;

		/**
		 * SCSS Context Parser
		 */
		contextParser(
			contextCode: string,
			lineNumberFor?: (index: number) => number
		): Context;

		/**
		 * Extract the code following `offset` in `code` buffer,
		 * delimited by braces.
		 *
		 * `offset` should be set to the position of the opening brace. If not,
		 * the function will jump to the next opening brace.
		 */
		extractCode(code: string, offset: number): string;
	}
}
