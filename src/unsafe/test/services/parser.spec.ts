'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import * as sinon from 'sinon';
import { Stats } from '@nodelib/fs.macchiato';
import type { DocumentLink } from 'vscode-languageclient';

import { parseDocument, convertLinksToImports } from '../../services/parser';
import * as helpers from '../helpers';
import { NodeType } from '../../types/nodes';
import type { IImport } from '../../types/symbols';

describe('Services/Parser', () => {
	describe('.parseDocument', () => {
		let statStub: sinon.SinonStub;

		beforeEach(() => {
			statStub = sinon.stub(fs, 'stat').yields(null, new Stats());
		});

		afterEach(() => {
			statStub.restore();
		});

		it('should return symbols', async () => {
			const document = helpers.makeDocument([
				'@import "file.scss";',
				'$name: "value";',
				'@mixin mixin($a: 1, $b) {}',
				'@function function($a: 1, $b) {}'
			]);

			const { symbols } = await parseDocument(document, null);

			// Variables
			assert.strictEqual(symbols.variables.length, 1);

			assert.strictEqual(symbols.variables[0]?.name, '$name');
			assert.strictEqual(symbols.variables[0]?.value, '"value"');

			// Mixins
			assert.strictEqual(symbols.mixins.length, 1);

			assert.strictEqual(symbols.mixins[0]?.name, 'mixin');
			assert.strictEqual(symbols.mixins[0]?.parameters.length, 2);

			assert.strictEqual(symbols.mixins[0]?.parameters[0]?.name, '$a');
			assert.strictEqual(symbols.mixins[0]?.parameters[0]?.value, '1');

			assert.strictEqual(symbols.mixins[0]?.parameters[1]?.name, '$b');
			assert.strictEqual(symbols.mixins[0]?.parameters[1]?.value, null);

			// Functions
			assert.strictEqual(symbols.functions.length, 1);

			assert.strictEqual(symbols.functions[0]?.name, 'function');
			assert.strictEqual(symbols.functions[0]?.parameters.length, 2);

			assert.strictEqual(symbols.functions[0]?.parameters[0]?.name, '$a');
			assert.strictEqual(symbols.functions[0]?.parameters[0]?.value, '1');

			assert.strictEqual(symbols.functions[0]?.parameters[1]?.name, '$b');
			assert.strictEqual(symbols.functions[0]?.parameters[1]?.value, null);

			// Imports
			assert.strictEqual(symbols.imports.length, 1);

			assert.ok(symbols.imports[0]?.filepath.endsWith('file.scss'));
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

			assert.strictEqual(node?.type, NodeType.Identifier);
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
