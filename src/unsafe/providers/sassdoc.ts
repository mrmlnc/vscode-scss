import { parse } from "scss-sassdoc-parser";

interface ISymbol {
	document?: string;
	info: any;
}

interface ISassDocOptions {
	displayOptions?: {
		alias?: boolean;
		author?: boolean;
		content?: boolean;
		deprecated?: boolean;
		description?: boolean;
		example?: boolean;
		link?: boolean;
		output?: boolean;
		parameter?: boolean;
		property?: boolean;
		require?: boolean;
		return?: boolean;
		see?: boolean;
		since?: boolean;
		throws?: boolean;
		type?: boolean;
	};
}

const defaultOptions = {
	displayOptions: {
		alias: true,
		author: true,
		content: true,
		deprecated: true,
		description: true,
		example: true,
		link: true,
		output: true,
		parameter: true,
		property: true,
		require: true,
		return: true,
		see: true,
		since: true,
		throws: true,
		type: true,
	},
};

export async function applySassDoc(
	symbol: ISymbol,
	identifierType: "function" | "mixin" | "variable",
	options?: ISassDocOptions
): Promise<string> {
	if (!symbol.document) {
		return "";
	}

	try {
		const sassdocs = await parse(symbol.document);
		if (sassdocs.length) {
			const name = symbol.info.name.replace("$", "");
			const displayOptions =
				options?.displayOptions || defaultOptions.displayOptions;

			for (const doc of sassdocs) {
				if (
					doc.description &&
					doc.context.type === identifierType &&
					doc.context.name === name
				) {
					// Loosely mimic the layout of JSDoc and the order of the default SassDoc template

					let description = "";

					if (displayOptions.description && doc.description) {
						description += doc.description.trimStart();
					}

					// Make it visible early on if something is marked as deprecated
					if (displayOptions.deprecated && doc.deprecated) {
						description += `\n\n@deprecated ${doc.deprecated}`;
					}

					// Function and mixin parameters, listed one per line like JSDoc
					if (displayOptions.parameter && doc.parameter) {
						for (const parameter of doc.parameter) {
							description += "\n\n@param";

							if (parameter.type) {
								description += ` {${parameter.type}}`;
							}

							description += `\`${parameter.name}\``;

							if (parameter.default) {
								description += ` [${parameter.default}]`;
							}

							if (parameter.description) {
								description += ` - ${parameter.description}`;
							}
						}
					}

					// Type is for standalone variable annotation
					// Type and Parameters is likely mutually exclusive
					if (displayOptions.type && doc.type) {
						description += `\n\n@type {${doc.type}}`;
					}

					// Documents the properties of a map
					if (displayOptions.property && doc.property) {
						for (const prop of doc.property) {
							description += "\n\n@prop";

							if (prop.type) {
								description += ` {${prop.type}}`;
							}

							description += `\`${prop.path}\``;

							if (prop.default) {
								description += ` [${prop.default}]`;
							}

							if (prop.description) {
								description += ` - ${prop.description}`;
							}
						}
					}

					// For fixins that take @content
					if (displayOptions.content && doc.content) {
						description += `\n\n@content ${doc.content}`;
					}

					// Describes mixin output
					if (displayOptions.output && doc.output) {
						description += `\n\n@output ${doc.output}`;
					}

					// Describes function return values with a type and optional description
					if (displayOptions.return && doc.return) {
						description += `\n\n@return {${doc.return.type}}${
							doc.return.description
								? ` - ${doc.return.description}`
								: ""
						}`;
					}

					if (displayOptions.throws && doc.throws) {
						for (const thrown of doc.throws) {
							description += `\n\n@throw ${thrown}`;
						}
					}

					if (displayOptions.require && doc.require.length) {
						for (const requirement of doc.require) {
							description += "\n\n@require";

							if (requirement.type) {
								description += ` {${requirement.type}}`;
							}

							description += `\`${requirement.name}\``;

							if (requirement.description) {
								description += ` - ${requirement.description}`;
							}

							if (requirement.url) {
								description += ` ${requirement.url}`;
							}
						}
					}

					if (displayOptions.alias && doc.alias) {
						const aliases =
							typeof doc.alias === "string"
								? [doc.alias]
								: doc.alias;
						for (const alias of aliases) {
							description += `\n\n@alias \`${alias}\``;
						}
					}

					// Hint to related variables, functions, or mixins
					if (displayOptions.see && doc.see) {
						for (const see of doc.see) {
							description += `\n\n@see \`${see}\``;
						}
					}

					if (displayOptions.since && doc.since) {
						for (const since of doc.since) {
							description += `\n\n@since ${since.version}`;
							if (since.description) {
								description += ` - ${since.description}`;
							}
						}
					}

					// Show credit to authors
					if (displayOptions.author && doc.author) {
						for (const author of doc.author) {
							description += `\n\n@author ${author}`;
						}
					}

					if (displayOptions.link && doc.link) {
						for (const link of doc.link) {
							if (link.caption) {
								description += `\n\n[${link.caption}](${link.url})`;
							} else {
								description += `\n\n${link.url}`;
							}
						}
					}

					if (displayOptions.example && doc.example) {
						for (const example of doc.example) {
							description += "\n\n@example";
							if (example.description) {
								description += ` ${example.description}`;
							}
							description += [
								"\n",
								"```scss",
								example.code,
								"```",
							].join("\n");
						}
					}

					return description;
				}
			}
		}
		return "";
	} catch (e) {
		// Shouldn't happen, but let's not crash the rest of the plugin in case this fails
		return "";
	}
}
