'use strict';

import * as assert from 'assert';

import { parseDocument } from '../../services/parser';
import * as helpers from '../helpers';
import { NodeType } from '../../types/nodes';

describe('Services/Parser', () => {
	describe('.parseDocument', () => {
		it('should return symbols', () => {
			const document = helpers.makeDocument([
				'@import "file.scss";',
				'$name: "value";',
				'@mixin mixin($a: 1, $b) {}',
				'@function function($a: 1, $b) {}'
			]);

			const { symbols } = parseDocument(document, null);

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

			// Functions
			assert.equal(symbols.functions.length, 1);

			assert.equal(symbols.functions[0].name, 'function');
			assert.equal(symbols.functions[0].parameters.length, 2);

			assert.equal(symbols.functions[0].parameters[0].name, '$a');
			assert.equal(symbols.functions[0].parameters[0].value, '1');

			assert.equal(symbols.functions[0].parameters[1].name, '$b');
			assert.equal(symbols.functions[0].parameters[1].value, null);

			// Imports
			assert.equal(symbols.imports.length, 1);

			assert.equal(symbols.imports[0].filepath, 'file.scss');
		});

		it('should include references as imports', () => {
			const document = helpers.makeDocument([
				'// <reference path="file">'
			]);

			const { symbols } = parseDocument(document);

			assert.equal(symbols.imports[0].filepath, 'file.scss');
			assert.ok(symbols.imports[0].reference);
		});

		it('should return Node at offset', () => {
			const lines = [
				'$name: "value";',
				'@mixin mixin($a: 1, $b) {}',
				'.test {',
				'    content: a|;',
				'}'
			];

			const document = helpers.makeDocument(lines);
			const offset = lines.join('\n').indexOf('|');

			const { node } = parseDocument(document, offset);

			assert.equal(node.type, NodeType.Identifier);
		});
	});
});
