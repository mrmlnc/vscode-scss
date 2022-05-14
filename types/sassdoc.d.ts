declare module "sassdoc" {
	export = sassdoc;

	function sassdoc(
		source?: string | string[],
		options?: sassdoc.SassDocOptions
	): Promise<void>;

	module sassdoc {
		export type SassDocOptions = {
			/**
			 * @default "./sassdoc"
			 */
			dest?: string;
			/**
			 * @default "[]"
			 */
			exclude?: string[];
			/**
			 * @default "./package.json"
			 */
			package?: string | Object;
			/**
			 * @default "default"
			 */
			theme?: string;
			/**
			 * @default "['requires', 'throws', 'content']"
			 */
			autofill?: string[];
			/**
			 * @default "{ undefined: 'general' }"
			 */
			groups?: Object;
			/**
			 * @default "false"
			 */
			noUpdateNotifier?: boolean;
			/**
			 * @default "false"
			 */
			verbose?: boolean;
			/**
			 * @default "false"
			 */
			strict?: boolean;
		};

		type Link = {
			url: string;
			caption?: string;
		};

		type Example = {
			type?: string;
			description?: string;
			code: string;
		};

		type Range = {
			start: number;
			end: number;
		};

		type Parameter = {
			type: string;
			name: string;
			default?: string;
			description: string;
		};

		type Property = {
			type: string;
			path: string;
			default?: string;
			description?: string;
		};

		type Require = {
			type: string;
			name: string;
			autofill?: boolean;
			description?: string;
			url?: string;
			item?: ParseResult;
		};

		type Since = {
			version?: string;
			description?: string;
		};

		export type ParseResult = {
			description?: string;
			commentRange: Range;
			context: {
				type: string;
				name: string;
				code: string;
				line: Range;
			};
			alias?: string | string[];
			aliased?: Array<ParseResult>;
			access: "public" | "private";
			author?: string[];
			content?: string;
			deprecated?: string;
			example?: Array<Example>;
			ignore?: string[];
			link?: Array<Link>;
			output?: string;
			parameter?: Array<Parameter>;
			property?: Array<Property>;
			return:
				| undefined
				| {
						type: string;
						description?: string;
				  };
			group: string[];
			require: Array<Require>;
			see?: string[];
			since?: Array<Since>;
			throw?: string[];
			todo?: string[];
			type?: string[];
			usedBy?: Array<ParseResult | "Circular">;
			file: {
				path: string;
				name: string;
			};
		};

		var parse: (
			source?: string | string[],
			options?: SassDocOptions
		) => Promise<Array<ParseResult>>;
	}
}
