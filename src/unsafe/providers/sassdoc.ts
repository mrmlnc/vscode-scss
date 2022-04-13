import * as sassdoc from 'sassdoc';

interface ISymbol {
	document?: string;
	info: any;
}

export async function applySassdoc(symbol: ISymbol, identifierType: "function" | "mixin" | "variable"): Promise<string> {
	try {
		const sassdocs = await sassdoc.parse(symbol.document);

		if (sassdocs.length) {
			// Sassdoc strips away the syntax, so we need to rebuild for our preview to look familiar
			const name = symbol.info.name.replace("$", "");
			for (let doc of sassdocs) {
				if (doc.description && doc.context.type === identifierType && doc.context.name === name) {
					let description = doc.description.split("\n").map(line => line ? `/// ${line}` : line).join("\n").trimStart();

					if (doc.author) {
						for (let author of doc.author) {
							description += `/// @author ${author}\n`;
						}
					}

					description += `/// @access ${doc.access}\n`;

					if (doc.parameter) {
						for (let parameter of doc.parameter) {
								description += `/// @param ${parameter.type ? `{${parameter.type}}` : ''} ${parameter.name}${parameter.description ? ` - ${parameter.description}` : ''}\n`;
						}
					}

					if (doc.return) {
							description += `/// @return {${doc.return.type}}\n`;
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