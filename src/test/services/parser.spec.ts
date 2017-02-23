'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { parseDocument } from '../../services/parser';
import { ISettings } from '../../types/settings';

function parseText(text: string[]): TextDocument {
	return TextDocument.create('test.scss', 'scss', 1, text.join('\n'));
}

describe('Services/Parser', () => {

	it('Find symbols without offset position', () => {
		const doc = parseText([
			'$name: "value";',
			'@mixin mixin($a: 1, $b) {}'
		]);

		const { symbols } = parseDocument('./fixtures', doc, null, <ISettings>{
			showErrors: false
		});

		// Variables
		assert.equal(symbols.variables.length, 1);

		assert.equal(symbols.variables[0].name, '$name');
		assert.equal(symbols.variables[0].value, '"value"');

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, 'mixin');
		assert.equal(symbols.mixins[0].parameters.length, 2);

		assert.equal(symbols.mixins[0].parameters[0].name, '$a');
		assert.equal(symbols.mixins[0].parameters[0].value, '1');

		assert.equal(symbols.mixins[0].parameters[1].name, '$b');
		assert.equal(symbols.mixins[0].parameters[1].value, null);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

	it('Find symbols with offset position', () => {
		const doc = parseText([
			'$name: "value";',
			'@function func($a) { @return $a }',
			'@mixin mixin($a: 1, $b) {',
			'  content: ',
			'}'
		]);

		const { symbols } = parseDocument('./fixtures', doc, 87, <ISettings>{
			showErrors: false
		});

		// Variables
		assert.equal(symbols.variables.length, 3);

		assert.equal(symbols.variables[0].name, '$name');
		assert.equal(symbols.variables[0].value, '"value"');

		assert.equal(symbols.variables[1].name, '$a');
		assert.equal(symbols.variables[1].value, '1');

		assert.equal(symbols.variables[2].name, '$b');
		assert.equal(symbols.variables[2].value, null);

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, 'mixin');
		assert.equal(symbols.mixins[0].parameters.length, 2);

		assert.equal(symbols.mixins[0].parameters[0].name, '$a');
		assert.equal(symbols.mixins[0].parameters[0].value, '1');

		assert.equal(symbols.mixins[0].parameters[1].name, '$b');
		assert.equal(symbols.mixins[0].parameters[1].value, null);

		// Functions
		assert.equal(symbols.functions.length, 1);

		assert.equal(symbols.functions[0].name, 'func');
		assert.equal(symbols.functions[0].parameters.length, 1);

		assert.equal(symbols.functions[0].parameters[0].name, '$a');
		assert.equal(symbols.functions[0].parameters[0].value, null);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

});
