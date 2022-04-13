import * as sassdoc from 'sassdoc';

interface ISymbol {
	document?: string;
	info: any;
}

interface ISassDocOptions {
  displayOptions?: {
		asDocString?: boolean;
    description?: boolean;
    author?: boolean;
    access?: boolean;
    parameters?: boolean;
    return?: boolean;
  };
}

const defaultOptions = {
  displayOptions: {
		asDocString: true,
    description: true,
    author: true,
    access: true,
    parameters: true,
    return: true,
  },
};

export async function applySassDoc(symbol: ISymbol, identifierType: "function" | "mixin" | "variable", options?: ISassDocOptions): Promise<string> {
	try {
		const sassdocs = await sassdoc.parse(symbol.document);
		if (sassdocs.length) {
      const name = symbol.info.name.replace("$", "");
      const displayOptions = options?.displayOptions || defaultOptions.displayOptions;

			for (let doc of sassdocs) {
				if (doc.description && doc.context.type === identifierType && doc.context.name === name) {
					let description = '';

          if (displayOptions.description) {
						if (displayOptions.asDocString) {
							description += doc.description.split("\n").map(line => line ? `/// ${line}` : line).join("\n").trimStart();
						} else {
							description += doc.description.trimStart();
						}
          }

					if (displayOptions.author && doc.author) {
						for (let author of doc.author) {
							if (displayOptions.asDocString) {
								description += '/// ';
							}
							description += `@author ${author}\n`;
						}
					}

          if (displayOptions.access) {
						if (displayOptions.asDocString) {
							description += '/// ';
						}
            description += `@access ${doc.access}\n`;
          }

					if (displayOptions.parameters && doc.parameter) {
						for (let parameter of doc.parameter) {
								if (displayOptions.asDocString) {
									description += '/// ';
								}
								description += `@param ${parameter.type ? `{${parameter.type}}` : ''} \`${parameter.name}\`${parameter.description ? ` - ${parameter.description}` : ''}\n`;
						}
					}

					if (displayOptions.return && doc.return) {
							if (displayOptions.asDocString) {
								description += '/// ';
							}
							description += `@return {${doc.return.type}}\n`;
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