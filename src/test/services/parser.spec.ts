'use strict';

import * as assert from 'assert';
import * as path from 'path';

import { parseDocument, convertLinksToImports, resolveReference } from '../../services/parser';
import * as helpers from '../helpers';
import { NodeType } from '../../types/nodes';
import { DocumentLink } from 'vscode-languageclient';
import { IImport } from '../../types/symbols';

describe('Services/Parser', () => {
	describe('.parseDocument', () => {
		it('should return symbols', async () => {
			const document = helpers.makeDocument([
				'@import "file.scss";',
				'$name: "value";',
				'@mixin mixin($a: 1, $b) {}',
				'@function function($a: 1, $b) {}'
			]);

			const { symbols } = await parseDocument(document, null);

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

		it('should include references as imports', async () => {
			const document = helpers.makeDocument([
				'// <reference path="file">'
			]);

			const { symbols } = await parseDocument(document);

			assert.equal(symbols.imports[0].filepath, 'file.scss');
			assert.ok(symbols.imports[0].reference);
		});

		it('should return Node at offset', async () => {
			const lines = [
				'$name: "value";',
				'@mixin mixin($a: 1, $b) {}',
				'.test {',
				'    content: a|;',
				'}'
			];

			const document = helpers.makeDocument(lines);
			const offset = lines.join('\n').indexOf('|');

			const { node } = await parseDocument(document, offset);

			assert.equal(node.type, NodeType.Identifier);
		});
	});

	describe('.resolveReference', () => {
		it('should return reference to the node_modules directory', () => {
			const expected = path.join('.', 'node_modules', 'foo.scss');

			const actual = resolveReference('~foo.scss', '.');

			assert.strictEqual(actual, expected);
		});

		it('should add default extension', () => {
			const expected = '_foo.scss';

			const actual = resolveReference('_foo', '.');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.convertLinksToImports', () => {
		it('should convert links to imports', () => {
			const links: DocumentLink[] = [
				{ target: '_partial.scss', range: helpers.makeSameLineRange() }
			];

			const expected: IImport[] = [
				{ filepath: '_partial.scss', dynamic: false, css: false }
			];

			const actual = convertLinksToImports(links);

			assert.deepStrictEqual(actual, expected);
		});

		it('should convert dynamic links to imports', () => {
			const links: DocumentLink[] = [
				{ target: '**/*.scss', range: helpers.makeSameLineRange() }
			];

			const expected: IImport[] = [
				{ filepath: '**/*.scss', dynamic: true, css: false }
			];

			const actual = convertLinksToImports(links);

			assert.deepStrictEqual(actual, expected);
		});

		it('should convert css links to imports', () => {
			const links: DocumentLink[] = [
				{ target: 'file.css', range: helpers.makeSameLineRange() }
			];

			const expected: IImport[] = [
				{ filepath: 'file.css', dynamic: false, css: true }
			];

			const actual = convertLinksToImports(links);

			assert.deepStrictEqual(actual, expected);
		});
	});
});
